// controllers/borrowingController.js
// Controller untuk mengelola operasi peminjaman buku

const BorrowingModel = require('../models/borrowingModel');

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
      console.log('📊 Dashboard Stats: Starting calculation for user:', req.user?._id);
      
      const userId = req.user?._id;
      if (!userId) {
        console.error('❌ Dashboard Stats: User not authenticated');
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const db = require('../config/db').getDb();
      const { ObjectId } = require('mongodb');
      
      console.log('🔍 Dashboard Stats: Fetching borrowings for user:', userId);
      
      // Get all user borrowings
      const borrowings = await db.collection('borrowings').find({ 
        user_id: new ObjectId(userId) 
      }).toArray();
      
      // Log first few borrowings for debugging
      if (borrowings.length > 0) {
        console.log('🔍 Dashboard Stats: Sample borrowing data:', {
          firstBorrowing: {
            _id: borrowings[0]._id,
            user_id: borrowings[0].user_id,
            books_id: borrowings[0].books_id,
            is_borrow: borrowings[0].is_borrow,
            borrow_date: borrowings[0].borrow_date,
            due_date: borrowings[0].due_date
          }
        });
      }
      
      console.log('📚 Dashboard Stats: Found', borrowings.length, 'borrowings');
      
      // Calculate statistics
      const totalBorrowed = borrowings.length;
      const activeBorrowings = borrowings.filter(b => b.is_borrow).length;
      const returnedBorrowings = borrowings.filter(b => !b.is_borrow).length;
      
      // Calculate overdue books
      const overdueBooks = borrowings.filter(b => {
        if (!b.is_borrow) return false;
        const dueDate = new Date(b.due_date);
        const today = new Date();
        return dueDate < today;
      }).length;

      // Calculate total pages read (estimate based on returned books)
      let totalPagesRead = 0;
      for (const borrowing of borrowings) {
        if (!borrowing.is_borrow) {
          try {
            const book = await db.collection('books').findOne({ _id: borrowing.books_id });
            if (book && book.pageCount) {
              totalPagesRead += book.pageCount;
            } else {
              totalPagesRead += 300; // Default estimate
            }
          } catch (bookError) {
            console.warn('⚠️ Dashboard Stats: Error fetching book details for', borrowing.books_id, bookError.message);
            totalPagesRead += 300; // Default estimate
          }
        }
      }

      // Calculate average reading time (estimate: 1 hour per 50 pages)
      const averageReadingTime = Math.round((totalPagesRead / 50) * 10) / 10;

      const stats = {
        totalBorrowed,
        activeBorrowings,
        returnedBorrowings,
        overdueBooks,
        totalPagesRead,
        averageReadingTime
      };

      // Ensure all values are numbers
      Object.keys(stats).forEach(key => {
        if (typeof stats[key] !== 'number') {
          stats[key] = 0;
        }
      });

      console.log('✅ Dashboard Stats: Calculated stats:', stats);

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
}

module.exports = BorrowingController; 