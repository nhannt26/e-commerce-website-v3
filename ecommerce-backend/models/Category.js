const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    image: {
      type: String,
      default: "https://via.placeholder.com/400x200?text=Category",
    },

    imageUrl: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ========= Hierarchy ========= */
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    level: {
      type: Number,
      default: 0, // 0 = root, 1 = subcategory, ...
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    /* ========= SEO ========= */
    metaTitle: {
      type: String,
      maxlength: 60,
    },

    metaDescription: {
      type: String,
      maxlength: 160,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* =========================
   VIRTUAL FIELDS
========================= */

// Count products in this category
categorySchema.virtual("productCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  count: true,
});

// Subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategory",
});

/* =========================
   MIDDLEWARE
========================= */

// Generate slug + level
categorySchema.pre("validate", async function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  if (this.parentCategory) {
    const parent = await this.constructor.findById(this.parentCategory);
    this.level = parent ? parent.level + 1 : 0;
  } else {
    this.level = 0;
  }
});

/* =========================
   INSTANCE METHODS
========================= */

// Get direct subcategories
categorySchema.methods.getSubcategories = function () {
  return this.constructor.find({ parentCategory: this._id });
};

// Get products in this category
categorySchema.methods.getAllProducts = function () {
  const Product = mongoose.model("Product");
  return Product.find({ category: this._id });
};

// Count products
categorySchema.methods.getProductCount = function () {
  const Product = mongoose.model("Product");
  return Product.countDocuments({ category: this._id });
};

/* =========================
   STATIC METHODS
========================= */

// Find by slug
categorySchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Get root categories (level 0)
categorySchema.statics.getRootCategories = function () {
  return this.find({ level: 0, isActive: true }).sort({
    displayOrder: 1,
    name: 1,
  });
};

// Get category tree (recursive)
categorySchema.statics.getCategoryTree = async function () {
  const categories = await this.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).lean();

  const map = {};
  const roots = [];

  categories.forEach((cat) => {
    map[cat._id] = { ...cat, subcategories: [] };
  });

  categories.forEach((cat) => {
    if (cat.parentCategory) {
      map[cat.parentCategory]?.subcategories.push(map[cat._id]);
    } else {
      roots.push(map[cat._id]);
    }
  });

  return roots;
};

module.exports = mongoose.model("Category", categorySchema);
