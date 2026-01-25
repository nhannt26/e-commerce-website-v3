const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    sku: {
      type: String,
      unique: true,
      required: function () {
        return !this.isNew; // chỉ bắt buộc sau khi đã tạo
      },
      uppercase: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    brand: {
      type: String,
      // required: [true, "Brand is required"],
      required: false,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // ================= PRICING =================
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [1000000, "Price too high"],
    },

    compareAtPrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
    },

    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
    },

    onSale: {
      type: Boolean,
      default: false,
    },

    saleStartDate: Date,
    saleEndDate: Date,

    // ================= INVENTORY =================
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    reserved: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 10,
    },

    stockStatus: {
      type: String,
      enum: ["in-stock", "low-stock", "out-of-stock", "discontinued"],
      default: "in-stock",
    },

    weight: {
      type: Number, // kg
      min: [0, "Weight cannot be negative"],
    },

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    // ================= MEDIA =================
    images: [
      {
        type: String,
        required: true,
      },
    ],

    features: [
      {
        type: String,
        trim: true,
      },
    ],

    specifications: {
      type: Map,
      of: String,
    },

    // ================= RATINGS =================
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },

    numReviews: {
      type: Number,
      default: 0,
      min: [0, "Number of reviews cannot be negative"],
    },

    // ================= STATUS =================
    featured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ================= METADATA =================
    metadata: {
      views: { type: Number, default: 0 },
      favorites: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//
// ================= INDEXES =================
//
productSchema.index({ name: "text", description: "text", brand: "text", tags: "text" });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ featured: 1, rating: -1 });
productSchema.index({ sku: 1 });

//
// ================= VIRTUAL FIELDS =================
//

// Final price (salePrice if on sale)
productSchema.virtual("finalPrice").get(function () {
  if (this.isOnSale && this.salePrice) return this.salePrice;
  return this.price;
});

// Discount amount in $
productSchema.virtual("discountAmount").get(function () {
  if (this.compareAtPrice && this.finalPrice < this.compareAtPrice) {
    return this.compareAtPrice - this.finalPrice;
  }
  return 0;
});

// Is currently on sale
productSchema.virtual("isOnSale").get(function () {
  if (!this.onSale || !this.salePrice) return false;

  const now = new Date();
  if (this.saleStartDate && now < this.saleStartDate) return false;
  if (this.saleEndDate && now > this.saleEndDate) return false;

  return true;
});

// In stock
productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

//
// ================= MIDDLEWARE =================
//

// Generate slug
productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();
  }
});

// Ensure at least one image
productSchema.pre("save", function () {
  if (!this.images || this.images.length === 0) {
    this.images = ["https://via.placeholder.com/600x400?text=Product"];
  }
});

productSchema.pre("save", function () {
  this.updateStockStatus();
});

productSchema.pre("save", function () {
  if (this.isNew && !this.sku) {
    this.sku = `SKU-${this._id.toString().slice(-6)}-${Date.now()}`;
  }
});

//
// ================= INSTANCE METHODS =================
//

// Increase views
productSchema.methods.incrementViews = async function () {
  this.metadata.views += 1;
  return await this.save();
};

// Increase favorites
productSchema.methods.addToFavorites = async function () {
  this.metadata.favorites += 1;
  return await this.save();
};

// Check availability
productSchema.methods.checkAvailability = function (quantity = 1) {
  return this.isActive && this.stock >= quantity;
};

// Update stock
productSchema.methods.updateStock = async function (quantity) {
  this.stock += quantity;
  if (this.stock < 0) this.stock = 0;
  return await this.save();
};

// Apply discount
productSchema.methods.applyDiscount = async function (percentage, startDate, endDate) {
  if (percentage <= 0 || percentage >= 100) {
    throw new Error("Discount percentage must be between 1 and 99");
  }

  this.salePrice = Math.round(this.price * (1 - percentage / 100));
  this.onSale = true;
  this.saleStartDate = startDate;
  this.saleEndDate = endDate;

  return await this.save();
};

// Get available stock (total - reserved)
productSchema.methods.getAvailableStock = function () {
  return Math.max(0, this.stock - this.reserved);
};

// Check if can fulfill quantity
productSchema.methods.canFulfill = function (quantity) {
  return this.getAvailableStock() >= quantity;
};

// Reserve stock for cart
productSchema.methods.reserveStock = async function (quantity) {
  if (!this.canFulfill(quantity)) {
    throw new Error("Insufficient stock available");
  }

  this.reserved += quantity;
  await this.save();
};

// Release reserved stock
productSchema.methods.releaseStock = async function (quantity) {
  this.reserved = Math.max(0, this.reserved - quantity);
  await this.save();
};

// Update stock status
productSchema.methods.updateStockStatus = function () {
  const available = this.getAvailableStock();

  if (available === 0) {
    this.stockStatus = "out-of-stock";
  } else if (available <= this.lowStockThreshold) {
    this.stockStatus = "low-stock";
  } else {
    this.stockStatus = "in-stock";
  }
};

//
// ================= STATIC METHODS =================
//

// Find by slug
productSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true }).populate("category");
};

// Search products
productSchema.statics.searchProducts = function (query) {
  return this.find({ $text: { $search: query }, isActive: true }, { score: { $meta: "textScore" } }).sort({
    score: { $meta: "textScore" },
  });
};

// Get products on sale
productSchema.statics.getOnSaleProducts = function () {
  const now = new Date();
  return this.find({
    onSale: true,
    salePrice: { $exists: true },
    $or: [
      { saleStartDate: { $lte: now }, saleEndDate: { $gte: now } },
      { saleStartDate: { $exists: false }, saleEndDate: { $exists: false } },
    ],
    isActive: true,
  });
};

// Get low stock products
productSchema.statics.getLowStockProducts = function (threshold = 10) {
  return this.find({ stock: { $lt: threshold }, isActive: true });
};

// Get most viewed products
productSchema.statics.getMostViewed = function (limit = 10) {
  return this.find({ isActive: true }).sort({ "metadata.views": -1 }).limit(limit);
};

module.exports = mongoose.model("Product", productSchema);
