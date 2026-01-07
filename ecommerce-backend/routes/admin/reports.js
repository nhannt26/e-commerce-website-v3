const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const reportController = require('../../controllers/admin/reportController');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// GET /api/admin/reports/sales - Sales report
router.get('/sales', reportController.getSalesReport);

// GET /api/admin/reports/products - Product report
router.get('/products', reportController.getProductReport);

// GET /api/admin/reports/customers - Customer report
router.get('/customers', reportController.getCustomerReport);

// GET /api/admin/reports/revenue - Revenue report
router.get('/revenue', reportController.getRevenueReport);

module.exports = router;
