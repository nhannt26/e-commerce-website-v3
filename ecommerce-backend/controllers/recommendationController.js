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
    if (!products || products.length === 0) {
      products = await Product.find({ isActive: true }).sort({ "metadata.views": -1 }).limit(8);
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
