const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/auth");
const {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  mergeCart,
  getCartSummary,
  validateCart,
  checkProduct,
  recoverCart,
  saveForLater,
  moveToCart,
  applyCoupon,
  removeCoupon,
} = require("../controllers/cartController");

// All cart routes use optionalAuth
// This means user can be logged in or guest

// GET /api/cart - Get cart
router.get("/", optionalAuth, getCart);

// POST /api/cart/items - Add item to cart
router.post("/items", optionalAuth, addItem);

// PUT /api/cart/items/:itemId - Update item quantity
router.put("/items/:itemId", optionalAuth, updateItemQuantity);

// DELETE /api/cart/items/:itemId - Remove item from cart
router.delete("/items/:itemId", optionalAuth, removeItem);

// DELETE /api/cart - Clear cart
router.delete("/", optionalAuth, clearCart);

// POST /api/cart/merge - Merge guest cart with user cart (on login)
router.post("/merge", optionalAuth, mergeCart);

// GET /api/cart/summary - Get cart summary
router.get("/summary", optionalAuth, getCartSummary);

// POST /api/cart/validate - Validate cart items
router.post("/validate", optionalAuth, validateCart);

// GET /api/cart/check/:productId - Check product stock in cart context
router.get("/check/:productId", optionalAuth, checkProduct);

// POST /api/cart/recover - Recover previous cart (if any)
router.post("/recover", optionalAuth, recoverCart);

// POST /api/cart/save-for-later/:itemId - Save item for later
router.post("/save-for-later/:itemId", optionalAuth, saveForLater);

// POST /api/cart/move-to-cart/:productId - Move saved item back to cart
router.post("/move-to-cart/:productId", optionalAuth, moveToCart);

// POST /api/cart/apply-coupon - Apply coupon to cart
router.post("/apply-coupon", optionalAuth, applyCoupon);

// DELETE /api/cart/remove-coupon - Remove coupon from cart
router.delete("/remove-coupon", optionalAuth, removeCoupon);

module.exports = router;
