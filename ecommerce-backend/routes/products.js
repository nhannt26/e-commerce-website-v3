const express = require("express");
const router = express.Router();
const { validateQueryParams } = require("../utils/validation");
const { default: products } = require("../data/products");
const { validateProduct, validateProductUpdate } = require("../middleware/validateProduct");
const cacheProducts = require("../middleware/cacheProducts");
const clearProductCache = require("../middleware/clearProductCache");

// ========== GET /api/products - Get all products with filters ==========
router.get("/", cacheProducts, (req, res) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    search,
    sort = "-price", // default: descending price
    limit = 10,
    page = 1,
  } = req.query;

  // Validate query parameters
  const validation = validateQueryParams(req.query);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors: validation.errors,
    });
  }

  let filteredProducts = [...products];

  // ===== Filters =====

  // Category filter
  if (category) {
    filteredProducts = filteredProducts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  // Brand filter
  if (brand) {
    filteredProducts = filteredProducts.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  // Price range filter
  if (minPrice) {
    filteredProducts = filteredProducts.filter((p) => p.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    filteredProducts = filteredProducts.filter((p) => p.price <= parseFloat(maxPrice));
  }

  // Minimum rating filter
  if (minRating) {
    filteredProducts = filteredProducts.filter((p) => p.rating >= parseFloat(minRating));
  }

  // In-stock filter
  if (inStock === "true") {
    filteredProducts = filteredProducts.filter((p) => p.stock > 0);
  }

  // Search filter (name, description, brand)
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower)
    );
  }

  // ===== Sorting =====
  const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
  const sortOrder = sort.startsWith("-") ? -1 : 1;

  const allowedSortFields = ["price", "rating", "name"];
  if (allowedSortFields.includes(sortField)) {
    filteredProducts.sort((a, b) => {
      if (typeof a[sortField] === "string") {
        return a[sortField].localeCompare(b[sortField]) * sortOrder;
      }
      return (a[sortField] - b[sortField]) * sortOrder;
    });
  }

  // ===== Pagination =====
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // ===== Response =====
  res.json({
    success: true,
    total: filteredProducts.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(filteredProducts.length / limitNum),
    data: paginatedProducts,
  });
});

// ========== GET /api/products/stats - Get product statistics ==========
router.get("/stats", (req, res) => {
  if (!products || products.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No products available for statistics",
    });
  }

  const totalProducts = products.length;
  const prices = products.map((p) => p.price);
  const totalValue = prices.reduce((acc, price) => acc + price, 0);
  const averagePrice = parseFloat((totalValue / totalProducts).toFixed(2));
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };

  // Calculate category breakdown
  const categoryMap = {};
  products.forEach((p) => {
    if (!categoryMap[p.category]) {
      categoryMap[p.category] = { total: 0, count: 0 };
    }
    categoryMap[p.category].total += p.price;
    categoryMap[p.category].count += 1;
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([category, info]) => ({
    category,
    count: info.count,
    averagePrice: parseFloat((info.total / info.count).toFixed(2)),
  }));

  res.json({
    success: true,
    data: {
      totalProducts,
      averagePrice,
      totalValue: parseFloat(totalValue.toFixed(2)),
      categoryBreakdown,
      priceRange,
    },
  });
});

// GET /api/products/featured
router.get("/featured", async (req, res) => {
  try {
    // Find featured products and limit to 5
    const featuredProducts = products.filter((p) => p.featured === true).slice(0, 5);

    res.status(200).json({
      success: true,
      count: featuredProducts.length,
      data: featuredProducts,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// GET /api/products/top-rated
router.get("/top-rated", (req, res) => {
  try {
    // Get limit from query string or default to 5
    const limit = parseInt(req.query.limit) || 5;

    // Sort by rating descending and take top N
    const topRatedProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, limit);

    res.status(200).json({
      success: true,
      data: topRatedProducts,
    });
  } catch (error) {
    console.error("Error fetching top-rated products:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ✅ GET /api/products/best-sellers
router.get("/best-sellers", (req, res) => {
  try {
    // Get limit from query params or default to 5
    const limit = parseInt(req.query.limit) || 5;

    // Sort by number of reviews (descending)
    const bestSellers = [...products].sort((a, b) => b.numReviews - a.numReviews).slice(0, limit);

    res.status(200).json({
      success: true,
      data: bestSellers,
    });
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ✅ GET /api/products/trending
router.get("/trending", (req, res) => {
  try {
    // Filter products that meet "trending" criteria
    const trendingProducts = products.filter((p) => p.rating >= 4.5 && p.numReviews >= 100 && p.stock > 0).slice(0, 8); // Limit to 8 products

    res.status(200).json({
      success: true,
      data: trendingProducts,
    });
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ========== GET /api/products/:id - Get single product ==========
router.get("/:id", (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

// ✅ GET /api/products/:id/related
router.get("/:id/related", (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    // Find the current product
    const currentProduct = products.find((p) => p.id === productId);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Filter products with the same category, excluding the current product
    const relatedProducts = products
      .filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id)
      .slice(0, 4); // Limit to 4 products

    res.status(200).json({
      success: true,
      count: relatedProducts.length,
      data: relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ========== POST /api/products - Create new product ==========
router.post("/", validateProduct, clearProductCache, (req, res) => {
  // Create product (validation passed)
  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1,
    name: req.body.name.trim(),
    description: req.body.description?.trim() || "",
    price: parseFloat(req.body.price),
    category: req.body.category.trim(),
    stock: req.body.stock || 0,
    image: req.body.image || "https://via.placeholder.com/300",
    rating: 0,
    numReviews: 0,
  };

  products.push(newProduct);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: newProduct,
  });
});

// ========== PUT /api/products/:id - Update product ==========
router.put("/:id", validateProductUpdate, clearProductCache, (req, res) => {
  const productIndex = products.findIndex((p) => p.id === parseInt(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Update product (keep existing values if not provided)
  products[productIndex] = {
    ...products[productIndex],
    ...req.body,
    id: products[productIndex].id, // Don't allow ID change
  };

  res.json({
    success: true,
    message: "Product updated successfully",
    data: products[productIndex],
  });
});

// ========== DELETE /api/products/:id - Delete product ==========
router.delete("/:id", clearProductCache, (req, res) => {
  const productIndex = products.findIndex((p) => p.id === parseInt(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];

  res.json({
    success: true,
    message: "Product deleted successfully",
    data: deletedProduct,
  });
});

module.exports = router;
