// routes/borrowingRoutes.js
// Routes untuk mengelola peminjaman buku

const express = require('express');
const BorrowingController = require('../controllers/borrowingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware untuk memastikan user terautentikasi
router.use(authMiddleware);

// Create new borrowing
router.post('/', BorrowingController.createBorrowing);

// Get all borrowings (admin only)
router.get('/', BorrowingController.getAllBorrowings);

// Get borrowings with details (admin only)
router.get('/with-details', BorrowingController.getBorrowingsWithDetails);

// Get borrowing by ID
router.get('/:id', BorrowingController.getBorrowingById);

// Get borrowings by user ID
router.get('/user/:userId', BorrowingController.getUserBorrowings);

// Return book
router.patch('/:id/return', BorrowingController.returnBook);

// Extend borrowing
router.patch('/:id/extend', BorrowingController.extendBorrowing);
// Notifikasi overdue
router.get('/overdue/notifications', BorrowingController.getOverdueNotifications);

//denda
router.patch('/:id/pay-fine', BorrowingController.payFine);

// Get borrowing statistics (admin only)
router.get('/stats/overview', BorrowingController.getBorrowingStats);

// Get current user's borrowings
router.get('/my/borrowings', BorrowingController.getMyBorrowings);

// Get user dashboard statistics
router.get('/my/dashboard-stats', BorrowingController.getUserDashboardStats);

// Get overdue borrowings (admin only)
router.get('/overdue/list', BorrowingController.getOverdueBorrowings);

module.exports = router; 