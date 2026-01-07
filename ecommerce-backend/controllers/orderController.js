const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// POST /api/orders - Create order from cart
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, customerNote } = req.body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    // Get user's cart
    const Cart = mongoose.model("Cart");
    const cart = await Cart.getCartForUser(req.user._id);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Validate cart before creating order
    const validation = await cart.validateCart();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Cart validation failed",
        errors: validation.errors,
      });
    }

    // Create order from cart
    const order = await Order.createFromCart(cart, req.user._id, shippingAddress, paymentMethod || "cod", customerNote);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders - Get user's orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate("items.product", "name images")
      .select("-statusHistory -adminNote");

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id - Get single order
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name images category")
      .populate("user", "firstName lastName email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check authorization
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/:id/cancel - Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check authorization
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Check if can be cancelled
    if (!order.canBeCancelled) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`,
      });
    }

    await order.cancel(reason || "Customer cancelled", req.user._id);

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/stats - Get user's order statistics
exports.getMyOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$pricing.total" },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments({ user: req.user._id });
    const totalSpent = await Order.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          paymentStatus: "paid",
        },
      },
      { $group: { _id: null, total: { $sum: "$pricing.total" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        byStatus: stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id/invoice - Download order invoice as PDF
exports.downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name")
      .populate("user", "firstName lastName email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Authorization
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this invoice",
      });
    }

    // Only completed orders
    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Invoice available only for completed orders",
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.orderNumber}.pdf`);

    doc.pipe(res);

    // ======================
    // HEADER
    // ======================
    doc.fontSize(20).text("INVOICE", { align: "center" }).moveDown();

    doc
      .fontSize(10)
      .text(`Order #: ${order.orderNumber}`)
      .text(`Order Date: ${order.createdAt.toDateString()}`)
      .text(`Payment Method: ${order.paymentMethod}`)
      .text(`Payment Status: ${order.paymentStatus}`)
      .moveDown();

    // ======================
    // CUSTOMER INFO
    // ======================
    doc.fontSize(12).text("Billing Information", { underline: true });
    doc
      .fontSize(10)
      .text(`${order.shippingAddress.fullName}`)
      .text(order.shippingAddress.street)
      .text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`)
      .text(`Phone: ${order.shippingAddress.phone}`)
      .moveDown();

    // ======================
    // ITEMS TABLE
    // ======================
    doc.fontSize(12).text("Order Items", { underline: true });
    doc.moveDown(0.5);

    order.items.forEach((item, index) => {
      doc
        .fontSize(10)
        .text(`${index + 1}. ${item.product.name}  |  Qty: ${item.quantity}  |  Price: $${item.price.toFixed(2)}`);
    });

    doc.moveDown();

    // ======================
    // PRICING
    // ======================
    doc.fontSize(12).text("Pricing Summary", { underline: true });
    doc
      .fontSize(10)
      .text(`Subtotal: $${order.pricing.subtotal.toFixed(2)}`)
      .text(`Shipping: $${order.pricing.shipping.toFixed(2)}`)
      .text(`Tax: $${order.pricing.tax.toFixed(2)}`)
      .text(`Discount: -$${order.pricing.discount.toFixed(2)}`)
      .moveDown(0.5)
      .fontSize(12)
      .text(`Total: $${order.pricing.total.toFixed(2)}`, {
        bold: true,
      });

    // ======================
    // FOOTER
    // ======================
    doc.moveDown(2);
    doc
      .fontSize(10)
      .text("Thank you for your purchase!", { align: "center" })
      .text("This invoice was generated electronically.", {
        align: "center",
      });

    doc.end();
  } catch (error) {
    next(error);
  }
};

exports.getOrderTimeline = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .select("user orderStatus statusHistory createdAt paymentStatus")
      .populate("statusHistory.updatedBy", "firstName lastName role");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Authorization
    if (
      order.user?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view order timeline",
      });
    }

    // Base timeline (always exists)
    const timeline = [
      {
        key: "created",
        label: "Order created",
        timestamp: order.createdAt,
        completed: true,
      },
    ];

    // Map status history
    const statusMap = {
      paid: "Payment received",
      processing: "Order processing started",
      packed: "Items packed",
      shipped: "Order shipped",
      out_for_delivery: "Out for delivery",
      delivered: "Delivered",
      cancelled: "Order cancelled",
    };

    order.statusHistory.forEach((event) => {
      timeline.push({
        key: event.status,
        label: statusMap[event.status] || event.status,
        timestamp: event.createdAt,
        note: event.note,
        updatedBy: event.updatedBy
          ? `${event.updatedBy.firstName} ${event.updatedBy.lastName}`
          : "System",
        completed: true,
      });
    });

    // Sort chronologically
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      success: true,
      data: {
        currentStatus: order.orderStatus,
        timeline,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
