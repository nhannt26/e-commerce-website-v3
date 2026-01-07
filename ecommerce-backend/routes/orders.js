const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const orderController = require("../controllers/orderController");

// All routes require authentication
router.use(protect);

// Customer order routes
// POST /api/orders - Create new order
router.post("/", orderController.createOrder);

// GET /api/orders - Get all orders for authenticated user
router.get("/", orderController.getMyOrders);

// GET /api/orders/stats - Get order statistics
router.get("/stats", orderController.getMyOrderStats);

// GET /api/orders/:id - Get specific order by ID
router.get("/:id", orderController.getOrder);

// POST /api/orders/:id/cancel - Cancel order
router.post("/:id/cancel", orderController.cancelOrder);

// GET /api/orders/:id/invoice - Download order invoice as PDF
router.get("/:id/invoice", orderController.downloadInvoice);

// GET /api/orders/:id/timeline - Get order timeline
router.get("/:id/timeline", orderController.getOrderTimeline);

module.exports = router;
