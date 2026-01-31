const Product = require("../models/Product");
const itemCF = require("../services/itemCF");

// GET /api/recommendation/item-cf/:userId - Get item-based collaborative filtering recommendations for a user
exports.getItemCF = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    let products = await itemCF(req.params.userId, 8);

    // 🔥 FALLBACK nếu Item-CF rỗng
    if (!products || products.length < 8) {
      const missing = 8 - (products?.length || 0);

      const fallback = await Product.find({
        isActive: true,
        _id: { $nin: products.map((p) => p._id) },
      })
        .sort({ "metadata.views": -1 })
        .limit(missing);

      products = [...products, ...fallback];
      console.log(products.length);
    }

    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
