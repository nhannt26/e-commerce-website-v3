const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Category = require("../models/Category");

const cacheProducts = require("../middleware/cacheProducts");
const clearProductCache = require("../middleware/clearProductCache");
const { validateProduct, validateProductUpdate } = require("../middleware/validateProduct");

/* =====================================================
   GET /api/products
   ===================================================== */
router.get("/", cacheProducts, async (req, res, next) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      featured,
      search,
      sort,
      page = 1,
      limit,
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (brand) query.brand = brand;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) query.rating = { $gte: Number(minRating) };
    if (inStock === "true") query.stock = { $gt: 0 };
    if (featured === "true") query.featured = true;

    if (search) {
      query.$text = { $search: search };
    }

    const sortOption = sort ? { [sort.replace("-", "")]: sort.startsWith("-") ? -1 : 1 } : { createdAt: -1 };

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   GET /api/products/slug/:slug
   ===================================================== */
router.get("/slug/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate("category", "name slug description");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   GET /api/products/on-sale
   ===================================================== */
router.get("/on-sale", async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const products = await Product.getOnSaleProducts()
      .sort({ discountPercentage: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name slug");

    const total = await Product.countDocuments({
      compareAtPrice: { $gt: 0 },
    });

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   GET /api/products/low-stock
   ===================================================== */
router.get("/low-stock", async (req, res, next) => {
  try {
    const threshold = Number(req.query.threshold) || 10;

    const products = await Product.find({
      stock: { $lt: threshold },
    }).populate("category", "name slug");

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   GET /api/products/:id
   ===================================================== */
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name slug description");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    next(error);
  }
});

/* =====================================================
   POST /api/products
   ===================================================== */
router.post("/", validateProduct, clearProductCache, async (req, res, next) => {
  try {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const product = await Product.create({
      ...req.body,
      category: req.body.category, // ObjectId
    });
    await product.populate("category");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   PUT /api/products/:id
   ===================================================== */
router.put("/:id", validateProductUpdate, clearProductCache, async (req, res, next) => {
  try {
    const product = await Product.findById(
      req.params.id,
      {
        ...req.body,
        category: req.body.category,
      },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    Object.assign(product, req.body);
    await product.save();
    await product.populate("category");

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   PATCH /api/products/:id/stock
   ===================================================== */
router.patch("/:id/stock", async (req, res, next) => {
  try {
    const { quantity, operation } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (operation === "add") product.stock += quantity;
    if (operation === "subtract") {
      if (product.stock - quantity < 0) {
        return res.status(400).json({ success: false, message: "Stock cannot be negative" });
      }
      product.stock -= quantity;
    }
    if (operation === "set") product.stock = quantity;

    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   PATCH /api/products/:id/views
   ===================================================== */
router.patch("/:id/views", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await product.incrementViews();

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   DELETE /api/products/:id
   ===================================================== */
router.delete("/:id", clearProductCache, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted successfully",
      data: { id: product._id },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id/stock - Check stock availability
router.get("/:id/stock", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: {
        productId: product._id,
        totalStock: product.stock,
        reserved: product.reserved,
        available: product.getAvailableStock(),
        stockStatus: product.stockStatus,
        isAvailable: product.getAvailableStock() > 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/products/:id/check-stock - Check if quantity available
router.post("/:id/check-stock", async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const canFulfill = product.canFulfill(quantity);

    res.json({
      success: true,
      data: {
        requested: quantity,
        available: product.getAvailableStock(),
        canFulfill: canFulfill,
        message: canFulfill ? `${quantity} items available` : `Only ${product.getAvailableStock()} items available`,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
