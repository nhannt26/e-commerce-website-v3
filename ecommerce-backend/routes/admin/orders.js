const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/auth");
const orderController = require("../../controllers/admin/orderController");

// All routes require admin authentication
router.use(protect);
router.use(authorize("admin"));

// Order management routes
// GET /api/admin/orders - Get all orders
router.get("/", orderController.getAllOrders);

// GET /api/admin/orders/stats/overview - Get order statistics overview
router.get("/stats/overview", orderController.getOrderStats);

// GET /api/admin/orders/:id - Get specific order by ID
router.get("/:id", orderController.getOrder);

// PUT /api/admin/orders/:id/status - Update order status
router.put("/:id/status", orderController.updateOrderStatus);

// PUT /api/admin/orders/:id/payment - Mark order as paid
router.put("/:id/payment", orderController.markAsPaid);

// PUT /api/admin/orders/:id/tracking - Add tracking information
router.put("/:id/tracking", orderController.addTracking);

module.exports = router;
