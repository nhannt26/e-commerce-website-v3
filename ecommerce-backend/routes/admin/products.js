const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const Product = require("../../models/Product");

// GET /api/admin/products/low-stock (admin only)
router.get('/low-stock', protect, authorize('admin'), async (req, res) => {
    const products = await Product.find({
        stockStatus: { $in: ['low-stock', 'out-of-stock'] }
    }).select('name stock reserved stockStatus');
    
    res.json({
        success: true,
        count: products.length,
        data: products
    });
});

module.exports = router;