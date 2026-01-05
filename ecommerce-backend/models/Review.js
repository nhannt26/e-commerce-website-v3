const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      index: true,
    },

    user: {
      name: {
        type: String,
        required: [true, "User name is required"],
        trim: true,
        maxlength: 50,
      },
      email: {
        type: String,
        required: [true, "User email is required"],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email"],
      },
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    comment: {
      type: String,
      required: [true, "Comment is required"],
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },

    verified: {
      type: Boolean,
      default: false, // true if user actually purchased
    },

    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },

    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

//
// ================= INDEXES =================
//

// Get reviews of a product (newest first)
reviewSchema.index({ product: 1, createdAt: -1 });

// Prevent same user reviewing same product twice
reviewSchema.index(
  { product: 1, "user.email": 1 },
  { unique: true }
);

//
// ================= HELPERS =================
//

async function updateProductRating(productId) {
  const Review = mongoose.model("Review");
  const Product = mongoose.model("Product");

  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10, // round 1 decimal
      numReviews: stats[0].numReviews,
    });
  } else {
    // No reviews left
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0,
    });
  }
}

//
// ================= MIDDLEWARE =================
//

// After save (create/update)
reviewSchema.post("save", async function () {
  await updateProductRating(this.product);
});

// After remove (deprecated but still useful)
reviewSchema.post("remove", async function () {
  await updateProductRating(this.product);
});

// For findOneAndDelete / findByIdAndDelete
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await updateProductRating(doc.product);
  }
});

module.exports = mongoose.model("Review", reviewSchema);
