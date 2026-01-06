const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Product = require("../models/Product");

router.use(protect);

// ==================================================
// GET /api/wishlist - Get user's wishlist
// ==================================================
router.get("/", async (req, res, next) => {
  try {
    await req.user.populate({
      path: "wishlist",
      select: "name price images rating stock category",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    const wishlist = req.user.wishlist.map((product) => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      images: product.images,
      rating: product.rating,
      category: product.category,
      inStock: product.stock > 0,
    }));

    res.json({
      success: true,
      count: wishlist.length,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
});

// ==================================================
// POST /api/wishlist/:productId - Add to wishlist
// ==================================================
router.post("/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;

    // 1. Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2. Check not already in wishlist
    const alreadyExists = req.user.wishlist.some((id) => id.toString() === productId);

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // 3. Add to wishlist
    req.user.wishlist.push(productId);

    // 4. Save user
    await req.user.save();

    res.json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    next(error);
  }
});

// ==================================================
// DELETE /api/wishlist/:productId - Remove from wishlist
// ==================================================
router.delete("/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;

    req.user.wishlist = req.user.wishlist.filter((id) => id.toString() !== productId);

    await req.user.save();

    res.json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
});

// ==================================================
// DELETE /api/wishlist - Clear wishlist
// ==================================================
router.delete("/", async (req, res, next) => {
  try {
    req.user.wishlist = [];
    await req.user.save();

    res.json({
      success: true,
      message: "Wishlist cleared",
    });
  } catch (error) {
    next(error);
  }
});

// ==================================================
// POST /api/wishlist/:productId/move-to-cart (BONUS)
// ==================================================
router.post("/:productId/move-to-cart", async (req, res, next) => {
  try {
    const { productId } = req.params;

    // TODO (future): Add product to cart

    // Remove from wishlist for now
    req.user.wishlist = req.user.wishlist.filter((id) => id.toString() !== productId);

    await req.user.save();

    res.json({
      success: true,
      message: "Product moved from wishlist",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
