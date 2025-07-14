// controllers/borrowingController.js
// Controller untuk mengelola operasi peminjaman buku

const BorrowingModel = require('../models/borrowingModel');
const { getDb } = require('../config/db');

class BorrowingController {
  // Create new borrowing
  static async createBorrowing(req, res) {
    try {
      const borrowingData = req.body;
      
      // Tambahkan handled_by dari user yang sedang login
      borrowingData.handled_by = req.user?.role_id || 'r2'; // Default ke pustakawan
      
      const result = await BorrowingModel.create(borrowingData);
      
      res.status(201).json({
        success: true,
        message: 'Book borrowed successfully',
        data: result.borrowing
      });
    } catch (error) {
      console.error('Error creating borrowing:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all borrowings
  static async getAllBorrowings(req, res) {
    try {
      const { page, limit, user_id, is_borrow } = req.query;
      
      const options = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
        user_id,
        is_borrow: is_borrow === 'true' ? true : is_borrow === 'false' ? false : undefined
      };

      const result = await BorrowingModel.findAll(options);
      
      res.status(200).json({
        success: true,
        data: result.borrowings,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error fetching borrowings:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get borrowings with details (book, user, handler info)
  static async getBorrowingsWithDetails(req, res) {
    try {
      const { page, limit, user_id, is_borrow } = req.query;
      
      const options = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
        user_id,
        is_borrow: is_borrow === 'true' ? true : is_borrow === 'false' ? false : undefined
      };

      const result = await BorrowingModel.findWithDetails(options);
      
      res.status(200).json({
        success: true,
        data: result.borrowings,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error fetching borrowings with details:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get borrowing by ID
  static async getBorrowingById(req, res) {
    try {
      const { id } = req.params;
      const borrowing = await BorrowingModel.findById(id);
      
      res.status(200).json({
        success: true,
        data: borrowing
      });
    } catch (error) {
      console.error('Error fetching borrowing:', error);
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get borrowings by user ID
  static async getUserBorrowings(req, res) {
    try {
      const { userId } = req.params;
      const borrowings = await BorrowingModel.findByUserId(userId);
      
      res.status(200).json({
        success: true,
        data: borrowings
      });
    } catch (error) {
      console.error('Error fetching user borrowings:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Return book
  static async returnBook(req, res) {
    try {
      const { id } = req.params;
      const result = await BorrowingModel.returnBook(id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error returning book:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get borrowing statistics
  static async getBorrowingStats(req, res) {
    try {
      const stats = await BorrowingModel.getStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching borrowing stats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Extend borrowing
  static async extendBorrowing(req, res) {
    try {
      const { id } = req.params;
      const extendDays = req.body.extendDays || 7;
      const result = await BorrowingModel.extendBorrowing(id, extendDays);
      res.json({ success: true, message: 'Borrowing extended', newDueDate: result.newDueDate });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get overdue borrowings for notification
  static async getOverdueNotifications(req, res) {
    try {
      const overdueBooks = await BorrowingModel.checkOverdueBooks();
      res.json({ success: true, data: overdueBooks });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update: saat fetch borrowing, hitung dan update denda jika overdue
  static async getMyBorrowings(req, res) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      const result = await BorrowingModel.findWithDetails({ user_id: userId });
      // Hitung dan update denda jika perlu
      const db = require('../config/db').getDb();
      for (const borrowing of result.borrowings) {
        const fine = BorrowingModel.calculateFine(borrowing);
        if (fine > 0 && (!borrowing.fine_amount || borrowing.fine_amount !== fine)) {
          await db.collection('borrowings').updateOne(
            { _id: borrowing._id },
            { $set: { fine_amount: fine, fine_due_date: new Date() } }
          );
          borrowing.fine_amount = fine;
        }
      }
      res.status(200).json({
        success: true,
        data: result.borrowings
      });
    } catch (error) {
      console.error('Error fetching my borrowings:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get overdue borrowings
  static async getOverdueBorrowings(req, res) {
    try {
      const { page, limit } = req.query;
      
      const options = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
        is_borrow: true
      };

      const result = await BorrowingModel.findWithDetails(options);
      
      // Filter hanya yang overdue
      const overdueBorrowings = result.borrowings.filter(borrowing => {
        const dueDate = new Date(borrowing.due_date);
        const today = new Date();
        return dueDate < today;
      });
      
      res.status(200).json({
        success: true,
        data: overdueBorrowings,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error fetching overdue borrowings:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get user dashboard statistics
  static async getUserDashboardStats(req, res) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      const db = require('../config/db').getDb();
      const { ObjectId } = require('mongodb');
      console.log('[DASHBOARD] Mulai aggregate statistik user:', userId);
      const start = Date.now();
      const statsAgg = await db.collection('borrowings').aggregate([
        { $match: { user_id: new ObjectId(userId) } },
        {
          $lookup: {
            from: 'books',
            localField: 'books_id',
            foreignField: '_id',
            as: 'book'
          }
        },
        { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalBorrowed: { $sum: 1 },
            activeBorrowings: { $sum: { $cond: ['$is_borrow', 1, 0] } },
            returnedBorrowings: { $sum: { $cond: ['$is_borrow', 0, 1] } },
            overdueBooks: {
              $sum: {
                $cond: [
                  { $and: ['$is_borrow', { $lt: ['$due_date', new Date()] }] },
                  1, 0
                ]
              }
            },
            totalPagesRead: {
              $sum: {
                $cond: [
                  { $eq: ['$is_borrow', false] },
                  '$book.pageCount',
                  0
                ]
              }
            }
          }
        }
      ]).toArray();
      const end = Date.now();
      console.log('[DASHBOARD] Aggregate selesai. Durasi:', (end - start), 'ms');
      const statsDoc = statsAgg[0] || {};
      const averageReadingTime = statsDoc.totalPagesRead ? Math.round((statsDoc.totalPagesRead / 50) * 10) / 10 : 0;
      const stats = {
        totalBorrowed: statsDoc.totalBorrowed || 0,
        activeBorrowings: statsDoc.activeBorrowings || 0,
        returnedBorrowings: statsDoc.returnedBorrowings || 0,
        overdueBooks: statsDoc.overdueBooks || 0,
        totalPagesRead: statsDoc.totalPagesRead || 0,
        averageReadingTime
      };
      console.log('[DASHBOARD] Statistik hasil:', stats);
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Dashboard Stats: Error fetching user dashboard stats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  //denda
  static async payFine(req, res) {
    try {
      const { id } = req.params;
      const db = require('../config/db').getDb();
      const borrowing = await db.collection('borrowings').findOne({ _id: new require('mongodb').ObjectId(id) });
      if (!borrowing || !borrowing.fine_amount || borrowing.fine_paid) {
        return res.status(400).json({ success: false, error: 'Tidak ada denda yang harus dibayar atau sudah lunas.' });
      }
      await db.collection('borrowings').updateOne(
        { _id: borrowing._id },
        { $set: { fine_paid: true } }
      );
      res.json({ success: true, message: 'Denda berhasil dibayar.' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Hitung pinjaman aktif
  static async countActiveLoans(req, res) {
    try {
      const db = require('../config/db').getDb();
      const count = await db.collection('borrowings').countDocuments({ return_date: { $exists: false } });
      res.json({ success: true, count });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Hitung pinjaman overdue
  static async countOverdueLoans(req, res) {
    try {
      const db = require('../config/db').getDb();
      const now = new Date();
      const count = await db.collection('borrowings').countDocuments({
        return_date: { $exists: false },
        due_date: { $lt: now }
      });
      res.json({ success: true, count });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Hitung pinjaman bulan ini
  static async countMonthlyLoans(req, res) {
    try {
      const db = require('../config/db').getDb();
      const now = new Date();
      now.setDate(1); now.setHours(0,0,0,0);
      const count = await db.collection('borrowings').countDocuments({ borrow_date: { $gte: now } });
      res.json({ success: true, count });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Aktivitas terbaru
  // Aktivitas terbaru
static async recentActivities(req, res) {
  try {
    const db = require('../config/db').getDb();
    const activities = await db.collection('borrowings').aggregate([
      { $sort: { borrow_date: -1 } },
      { $limit: 10 },
      // Join ke user
      { $lookup: {
          from: 'user',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
      }},
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      // Join ke books
      { $lookup: {
          from: 'books',
          localField: 'books_id',
          foreignField: '_id',
          as: 'book'
      }},
      { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
      // Project hanya field yang dibutuhkan
      { $project: {
          _id: 1,
          type: { $literal: 'borrow' },
          borrow_date: 1,
          user: { _id: '$user._id', name: '$user.full_name', avatar: '$user.profile_picture' },
          book: { _id: '$book._id', title: '$book.title' }
      }}
    ]).toArray();
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
}

module.exports = BorrowingController; 