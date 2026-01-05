const express = require("express");
const router = express.Router();

const Review = require("../models/Review");
const Product = require("../models/Product");

/* =====================================================
   POST /api/products/:productId/reviews
   ===================================================== */
router.post("/products/:productId/reviews", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { user, rating, title, comment, images } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const review = await Review.create({
      product: productId,
      user,
      rating,
      title,
      comment,
      images,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    // ✅ BẮT DUPLICATE REVIEW
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    next(error);
  }
});

/* =====================================================
   GET /api/products/:productId/reviews
   ===================================================== */
router.get("/products/:productId/reviews", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = "recent", // recent | helpful | rating
    } = req.query;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let sortOption = { createdAt: -1 };

    if (sort === "helpful") sortOption = { helpful: -1 };
    if (sort === "rating") sortOption = { rating: -1 };

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId })
      .populate("product", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ product: productId });

    res.json({
      success: true,
      count: reviews.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   GET /api/reviews/:id
   ===================================================== */
router.get("/reviews/:id", async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate("product", "name slug");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Invalid review ID",
      });
    }
    next(error);
  }
});

/* =====================================================
   PUT /api/reviews/:id
   ===================================================== */
router.put("/reviews/:id", async (req, res, next) => {
  try {
    const { rating, title, comment, images } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;

    await review.save(); // middleware sẽ recalc rating

    res.json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   DELETE /api/reviews/:id
   ===================================================== */
router.delete("/reviews/:id", async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await review.deleteOne(); // middleware sẽ recalc rating

    res.json({
      success: true,
      message: "Review deleted successfully",
      data: { id: review._id },
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   PATCH /api/reviews/:id/helpful
   ===================================================== */
router.patch("/reviews/:id/helpful", async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.helpful += 1;
    await review.save();

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
