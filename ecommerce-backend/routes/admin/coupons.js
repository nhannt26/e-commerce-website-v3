const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const Coupon = require('../../models/Coupon');

// POST /api/admin/coupons - Create a new coupon (admin only)
router.post("/", protect, authorize('admin'), async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/coupons - Get all coupons (admin only)
router.get("/", protect, authorize('admin'), async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;