const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Product = require("../models/Product");
const User = require("../models/User");

/**
 * Helper: lấy cart cho user hoặc session
 */
const getCart = async (req) => {
  if (req.user) {
    return await Cart.getCartForUser(req.user._id);
  }

  if (!req.session.cartId) {
    return null;
  }

  return await Cart.getCartForSession(req.session.cartId);
};

// ========== GET CART ==========
exports.getCart = async (req, res, next) => {
  try {
    let cart = req.user
      ? await Cart.getCartForUser(req.user._id)
      : await Cart.getCartForSession(req.session.cartId || (req.session.cartId = req.sessionID));

    await cart.populateItems();

    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// ========== ADD ITEM TO CART ==========
exports.addItem = async (req, res, next) => {
  try {
    let { productId, quantity } = req.body;
    console.log(req.body);

    // 🔒 Nếu FE gửi nhầm object
    if (typeof productId === "object" && productId.productId) {
      quantity = productId.quantity ?? quantity;
      productId = productId.productId;
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Get cart
    let cart;
    if (req.user) {
      cart = await Cart.getCartForUser(req.user._id);
    } else {
      cart = await Cart.getCartForSession(req.sessionID);
    }

    // Add item
    await cart.addItem(productId, qty);

    // Populate and return
    await cart.populate();

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    // Handle specific errors
    if (
      error.message.includes("not found") ||
      error.message.includes("not available") ||
      error.message.includes("stock")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ========== UPDATE ITEM QUANTITY ==========
exports.updateItemQuantity = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    // Get cart
    let cart;
    if (req.user) {
      cart = await Cart.getCartForUser(req.user._id);
    } else {
      if (!req.session.cartId) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }
      cart = await Cart.getCartForSession(req.session.cartId);
    }

    // Update quantity
    await cart.updateItemQuantity(itemId, parseInt(quantity));

    // Populate and return
    await cart.populate();

    res.json({
      success: true,
      message: "Item quantity updated",
      data: cart,
    });
  } catch (error) {
    if (error.message.includes("not found") || error.message.includes("stock")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ========== REMOVE ITEM FROM CART ==========
exports.removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    // Get cart
    let cart;
    if (req.user) {
      cart = await Cart.getCartForUser(req.user._id);
    } else {
      if (!req.session.cartId) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }
      cart = await Cart.getCartForSession(req.session.cartId);
    }

    // Remove item
    await cart.removeItem(itemId);

    // Populate and return
    await cart.populate();

    res.json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ========== CLEAR CART ==========
exports.clearCart = async (req, res, next) => {
  try {
    // Get cart
    let cart;
    if (req.user) {
      cart = await Cart.getCartForUser(req.user._id);
    } else {
      if (!req.session.cartId) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }
      cart = await Cart.getCartForSession(req.session.cartId);
    }

    // Clear cart
    await cart.clearCart();

    res.json({
      success: true,
      message: "Cart cleared",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// ========== MERGE CART ON LOGIN ==========
exports.mergeCart = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!req.session.cartId) {
      // No guest cart to merge
      const cart = await Cart.getCartForUser(req.user._id);
      await cart.populate();

      return res.json({
        success: true,
        message: "Using user cart",
        data: cart,
      });
    }

    // Merge guest cart with user cart
    const cart = await Cart.mergeGuestCart(req.session.cartId, req.user._id);
    await cart.populate();

    // Clear session cart ID
    delete req.session.cartId;

    res.json({
      success: true,
      message: "Carts merged successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cart/summary
 * Lấy thông tin tóm tắt giỏ hàng
 */
exports.getCartSummary = async (req, res, next) => {
  try {
    const cart = await getCart(req);

    if (!cart) {
      return res.json({
        success: true,
        data: {
          itemCount: 0,
          subtotal: 0,
          total: 0,
        },
      });
    }

    res.json({
      success: true,
      data: {
        itemCount: cart.getItemCount(),
        subtotal: cart.totals.subtotal,
        total: cart.totals.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart/validate
 * Validate giỏ hàng trước khi checkout
 */
exports.validateCart = async (req, res, next) => {
  try {
    const cart = await getCart(req);

    if (!cart) {
      return res.json({
        success: true,
        isValid: false,
        errors: ["Cart is empty"],
        cart: null,
      });
    }

    // validateCart() là method trong Cart model
    // ví dụ: check stock, product tồn tại, giá thay đổi…
    const validationResult = await cart.validateCart();

    res.json({
      success: true,
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cart/check/:productId
 * Kiểm tra sản phẩm có trong cart không
 */
exports.checkProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await getCart(req);

    if (!cart) {
      return res.json({
        success: true,
        inCart: false,
        quantity: 0,
      });
    }

    const cartItem = cart.items.find((item) => item.product.toString() === productId);

    res.json({
      success: true,
      inCart: !!cartItem,
      quantity: cartItem ? cartItem.quantity : 0,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/recover - Recover abandoned cart
exports.recoverCart = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required to recover cart",
      });
    }

    // Find user's most recent cart
    const cart = await Cart.findOne({ user: req.user._id }).sort({ updatedAt: -1 }).populate("items.product");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "No cart found",
      });
    }

    // Validate cart items still available
    const validation = await cart.validateCart();

    res.json({
      success: true,
      message: "Cart recovered",
      data: cart,
      validation: validation,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/save-for-later/:itemId
exports.saveForLater = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }

    // Get cart
    const cart = await Cart.getCartForUser(req.user._id);
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Add to user's wishlist
    const user = await User.findById(req.user._id);

    if (!user.wishlist.includes(item.product)) {
      user.wishlist.push(item.product);
      await user.save();
    }

    // Remove from cart
    await cart.removeItem(itemId);

    res.json({
      success: true,
      message: "Item saved for later",
      data: {
        cart: cart,
        wishlistCount: user.wishlist.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/move-to-cart/:productId - Move from wishlist to cart
exports.moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }

    // Remove from wishlist
    const user = await User.findById(req.user._id);
    user.wishlist.pull(productId);
    await user.save();

    // Add to cart
    const cart = await Cart.getCartForUser(req.user._id);
    await cart.addItem(productId, quantity || 1);
    await cart.populate();

    res.json({
      success: true,
      message: "Item moved to cart",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/apply-coupon - Apply coupon to cart
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const now = new Date();

    const cart = await Cart.getCart(req);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon" });
    }

    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({
        message: "Coupon expired or not active yet",
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        message: "Coupon usage limit reached",
      });
    }

    /* ===== ÉP KIỂU & VALIDATE ===== */
    const subtotal = Number(cart.subtotal ?? 0);
    const discountValue = Number(coupon.discountValue ?? 0);
    const maximumDiscount = coupon.maximumDiscount != null ? Number(coupon.maximumDiscount) : null;

    if (subtotal <= 0) {
      return res.status(400).json({ message: "Cart subtotal is invalid" });
    }

    if (discountValue <= 0) {
      return res.status(400).json({ message: "Coupon discount value invalid" });
    }

    if (isNaN(subtotal) || isNaN(discountValue)) {
      return res.status(400).json({
        message: "Invalid cart or coupon data",
      });
    }

    if (subtotal < coupon.minimumPurchase) {
      return res.status(400).json({
        message: `Minimum purchase ${coupon.minimumPurchase} required`,
      });
    }

    /* ===== TÍNH DISCOUNT ===== */
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * discountValue) / 100;

      if (maximumDiscount !== null) {
        discountAmount = Math.min(discountAmount, maximumDiscount);
      }
    } else {
      discountAmount = discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    if (isNaN(discountAmount) || discountAmount < 0) {
      return res.status(400).json({
        message: "Failed to calculate discount",
      });
    }

    /* ===== SAVE CART ===== */
    cart.coupon = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: discountValue,
      discountAmount: Number(discountAmount),
    };

    cart.total = subtotal - discountAmount;

    await cart.save();

    res.json({
      success: true,
      message: "Coupon applied successfully",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/remove-coupon - Remove coupon from cart
exports.removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.getCart(req);

    if (!cart || !cart.coupon) {
      return res.status(400).json({ message: "No coupon applied" });
    }

    cart.coupon = undefined;
    cart.total = cart.subtotal;

    await cart.save();

    res.json({
      success: true,
      message: "Coupon removed",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};
