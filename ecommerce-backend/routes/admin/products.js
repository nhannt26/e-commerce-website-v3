const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/auth");
const Product = require("../../models/Product");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/admin/products/low-stock (admin only)
router.get("/low-stock", protect, authorize("admin"), async (req, res) => {
  const products = await Product.find({
    stockStatus: { $in: ["low-stock", "out-of-stock"] },
  }).select("name stock reserved stockStatus");

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

// CREATE product
// POST /api/admin/products
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 5), // 🔥 BẮT BUỘC
  async (req, res, next) => {
    try {
      console.log("BODY:", req.body); // kiểm tra

      const product = await Product.create({
        ...req.body,
        price: Number(req.body.price),
        stock: Number(req.body.stock),
        discount: Number(req.body.discount || 0),
        isActive: req.body.isActive === "true",
      });

      await product.save();

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (err) {
      next(err);
    }
  },
);

// UPDATE product
// PUT /api/admin/products/:id
router.put("/:id", protect, authorize("admin"), upload.array("images", 5), async (req, res, next) => {
  try {
    // ❌ Xóa sku nếu client cố gửi
    delete req.body.sku;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        price: Number(req.body.price),
        stock: Number(req.body.stock),
        discount: Number(req.body.discount || 0),
        isActive: req.body.isActive === "true",
      },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE product
// DELETE /api/admin/products/:id
router.delete("/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
