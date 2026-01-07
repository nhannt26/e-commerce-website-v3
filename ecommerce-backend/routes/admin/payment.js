const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const paymentController = require('../../controllers/admin/paymentController');
const dashboardController = require('../../controllers/admin/paymentDashboardController');

router.use(protect);
router.use(authorize('admin'));

// GET /api/admin/payment/transactions - Get all transactions
router.get('/transactions', paymentController.getAllTransactions);

// GET /api/admin/payment/stats - Get payment statistics
router.get('/stats', paymentController.getPaymentStats);

// POST /api/admin/payment/refund/:transactionId - Process refund
router.post('/refund/:transactionId', paymentController.processRefund);

// GET /api/admin/payment/dashboard - Payment dashboard
router.get('/dashboard', dashboardController.getPaymentDashboard);

// GET /api/admin/payment/revenue-report - Revenue report
router.get('/revenue-report', dashboardController.getRevenueReport);

module.exports = router;
