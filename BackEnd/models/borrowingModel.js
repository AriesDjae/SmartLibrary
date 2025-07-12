// models/borrowingModel.js
// Model untuk mengelola peminjaman buku

const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class BorrowingModel {
  // Tambahkan field denda ke schema
  static schema = {
    user_id: { type: 'objectid', required: true },
    books_id: { type: 'string', required: true },
    borrow_date: { type: 'date', required: true },
    due_date: { type: 'date', required: true },
    return_date: { type: 'date', required: false },
    is_borrow: { type: 'boolean', required: true },
    handled_by: { type: 'string', required: true },
    fine_amount: { type: 'number', required: false },
    fine_paid: { type: 'boolean', required: false },
    fine_due_date: { type: 'date', required: false },
    renewalCount: { type: 'number', required: false }
  };

  // Validasi data peminjaman
  static validate(borrowingData) {
    const errors = [];
    
    // Validasi user_id
    if (!borrowingData.user_id) {
      errors.push('User ID is required');
    } else if (typeof borrowingData.user_id !== 'string' || !/^[a-fA-F0-9]{24}$/.test(borrowingData.user_id)) {
      errors.push('User ID must be a valid 24-char hex string');
    }

    // Validasi books_id
    if (!borrowingData.books_id) {
      errors.push('Book ID is required');
    } else if (typeof borrowingData.books_id !== 'string') {
      errors.push('Book ID must be a string');
    }

    // Validasi borrow_date
    if (!borrowingData.borrow_date) {
      errors.push('Borrow date is required');
    }

    // Validasi due_date
    if (!borrowingData.due_date) {
      errors.push('Due date is required');
    }

    // Validasi is_borrow
    if (typeof borrowingData.is_borrow !== 'boolean') {
      errors.push('is_borrow must be a boolean');
    }

    // Validasi handled_by
    if (!borrowingData.handled_by) {
      errors.push('Handled by is required');
    } else if (typeof borrowingData.handled_by !== 'string') {
      errors.push('Handled by must be a string');
    }

    return errors;
  }

  // Sanitize data sebelum disimpan
  static sanitize(borrowingData) {
    const { ObjectId } = require('mongodb');
    const sanitized = {};
  
    // Konversi user_id ke ObjectId
    if (borrowingData.user_id) sanitized.user_id = new ObjectId(borrowingData.user_id);
    if (borrowingData.books_id) sanitized.books_id = borrowingData.books_id;
    if (borrowingData.borrow_date) sanitized.borrow_date = new Date(borrowingData.borrow_date);
    if (borrowingData.due_date) sanitized.due_date = new Date(borrowingData.due_date);
    if (borrowingData.return_date) sanitized.return_date = new Date(borrowingData.return_date);
    if (typeof borrowingData.is_borrow === 'boolean') sanitized.is_borrow = borrowingData.is_borrow;
    if (borrowingData.handled_by) sanitized.handled_by = borrowingData.handled_by;
  
    sanitized.updatedAt = new Date();
    if (!borrowingData.createdAt) sanitized.createdAt = new Date();
  
    return sanitized;
  }

  // CRUD Operations

  // Create new borrowing
  static async create(borrowingData) {
    const db = getDb();
    
    try {
      // Validasi data
      const validationErrors = this.validate(borrowingData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Sanitize data
      const sanitizedData = this.sanitize(borrowingData);
      
      // Cek apakah buku sudah dipinjam oleh user yang sama
      const existingBorrowing = await db.collection('borrowings').findOne({
        user_id: sanitizedData.user_id,
        books_id: sanitizedData.books_id,
        is_borrow: true
      });

      if (existingBorrowing) {
        throw new Error('User has already borrowed this book');
      }

      // Cek apakah buku tersedia
      const book = await db.collection('books').findOne({ _id: sanitizedData.books_id });
      if (!book) {
        throw new Error('Book not found');
      }

      if (!book.isAvailable) {
        throw new Error('Book is not available for borrowing');
      }

      // Insert peminjaman baru
      const result = await db.collection('borrowings').insertOne(sanitizedData);
      
      // Update status buku menjadi tidak tersedia
      await db.collection('books').updateOne(
        { _id: sanitizedData.books_id },
        { $set: { isAvailable: false } }
      );

      return {
        success: true,
        borrowing: { ...sanitizedData, _id: result.insertedId }
      };
    } catch (error) {
      throw new Error(`Failed to create borrowing: ${error.message}`);
    }
  }

  // Get all borrowings with optional filters
  static async findAll(options = {}) {
    const db = getDb();
    const {
      page = 0,
      limit = 10,
      user_id,
      is_borrow,
      sortBy = 'borrow_date',
      sortOrder = -1
    } = options;

    let query = {};
    
    // Filter by user_id
    if (user_id) {
      try {
        query.user_id = new ObjectId(user_id);
      } catch (e) {
        query.user_id = user_id; // fallback jika bukan ObjectId
      }
    }
    
    // Filter by is_borrow status
    if (typeof is_borrow === 'boolean') {
      query.is_borrow = is_borrow;
    }

    try {
      const borrowings = await db.collection('borrowings')
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(page * limit)
        .limit(limit)
        .toArray();

      const total = await db.collection('borrowings').countDocuments(query);
      
      return {
        borrowings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch borrowings: ${error.message}`);
    }
  }

  // Get borrowing by ID
  static async findById(id) {
    const db = getDb();
    try {
      const borrowing = await db.collection('borrowings').findOne({ _id: new ObjectId(id) });
      if (!borrowing) {
        throw new Error('Borrowing not found');
      }
      return borrowing;
    } catch (error) {
      throw new Error(`Failed to fetch borrowing: ${error.message}`);
    }
  }

  // Get borrowings with book and user details
  static async findWithDetails(options = {}) {
    const db = getDb();
    const {
      page = 0,
      limit = 10,
      user_id,
      is_borrow
    } = options;

    let matchQuery = {};
    
    if (user_id) {
      try {
        matchQuery.user_id = new ObjectId(user_id);
      } catch (e) {
        matchQuery.user_id = user_id;
      }
    }
    if (typeof is_borrow === 'boolean') matchQuery.is_borrow = is_borrow;

    try {
      const borrowings = await db.collection('borrowings')
        .aggregate([
          { $match: matchQuery },
          // Pastikan books_id (string) join ke _id (string) di books
          {
            $lookup: {
              from: 'books',
              localField: 'books_id',
              foreignField: '_id',
              as: 'book'
            }
          },
          // Jika tidak ketemu, book akan jadi array kosong
          { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'roles',
              localField: 'handled_by',
              foreignField: '_id',
              as: 'handler'
            }
          },
          { $unwind: { path: '$handler', preserveNullAndEmptyArrays: true } },
          { $sort: { borrow_date: -1 } },
          { $skip: page * limit },
          { $limit: limit }
        ]).toArray();

      // Fallback: jika book kosong, tambahkan info minimal agar frontend tidak error
      const borrowingsWithBookFallback = borrowings.map(b => ({
        ...b,
        book: b.book || { title: 'Buku tidak ditemukan', author: '', coverImage: '', genres: [] }
      }));

      console.log('Borrowings with details:', JSON.stringify(borrowingsWithBookFallback, null, 2));

      const total = await db.collection('borrowings').countDocuments(matchQuery);
      
      return {
        borrowings: borrowingsWithBookFallback,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch borrowings with details: ${error.message}`);
    }
  }

  // Get borrowings by user ID
  static async findByUserId(userId) {
    const db = getDb();
    try {
      let query = {};
      try {
        query.user_id = new ObjectId(userId);
      } catch (e) {
        query.user_id = userId;
      }
      const borrowings = await db.collection('borrowings')
        .find(query)
        .sort({ borrow_date: -1 })
        .toArray();
      
      return borrowings;
    } catch (error) {
      throw new Error(`Failed to fetch user borrowings: ${error.message}`);
    }
  }

  // Return book (update borrowing status)
  static async returnBook(borrowingId) {
    const db = getDb();
    
    try {
      const borrowing = await this.findById(borrowingId);
      
      if (!borrowing.is_borrow) {
        throw new Error('Book is already returned');
      }

      // Update borrowing status
      const result = await db.collection('borrowings').updateOne(
        { _id: new ObjectId(borrowingId) },
        { 
          $set: { 
            is_borrow: false,
            return_date: new Date(),
            updatedAt: new Date()
          } 
        }
      );

      if (result.matchedCount === 0) {
        throw new Error('Borrowing not found');
      }

      // Update book availability
      await db.collection('books').updateOne(
        { _id: borrowing.books_id },
        { $set: { isAvailable: true } }
      );

      return {
        success: true,
        message: 'Book returned successfully'
      };
    } catch (error) {
      throw new Error(`Failed to return book: ${error.message}`);
    }
  }

  // Hitung denda (misal 1000 per hari keterlambatan)
  static calculateFine(borrowing) {
    const now = new Date();
    const due = new Date(borrowing.due_date);
    if (now > due && borrowing.is_borrow) {
      const daysLate = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      const fine = daysLate * 1000; // misal 1000 per hari
      return fine;
    }
    return 0;
  }

  // Extend peminjaman (perpanjang jatuh tempo)
  static async extendBorrowing(borrowingId, extendDays = 7) {
    const db = getDb();
    const { ObjectId } = require('mongodb');
    try {
      const borrowing = await db.collection('borrowings').findOne({ _id: new ObjectId(borrowingId) });
      if (!borrowing || !borrowing.is_borrow) {
        throw new Error('Cannot extend this borrowing');
      }
      const newDueDate = new Date(borrowing.due_date);
      newDueDate.setDate(newDueDate.getDate() + extendDays);
      const result = await db.collection('borrowings').updateOne(
        { _id: new ObjectId(borrowingId) },
        { $set: { due_date: newDueDate }, $inc: { renewalCount: 1 } }
      );
      return { success: true, newDueDate };
    } catch (error) {
      throw new Error(`Failed to extend borrowing: ${error.message}`);
    }
  }

  // Cek buku overdue (untuk notifikasi)
  static async checkOverdueBooks() {
    const db = getDb();
    const overdueBooks = await db.collection('borrowings').find({
      is_borrow: true,
      due_date: { $lt: new Date() }
    }).toArray();
    return overdueBooks;
  }

  // Get borrowing statistics
  static async getStats() {
    const db = getDb();
    try {
      const totalBorrowings = await db.collection('borrowings').countDocuments();
      const activeBorrowings = await db.collection('borrowings').countDocuments({ is_borrow: true });
      const returnedBorrowings = await db.collection('borrowings').countDocuments({ is_borrow: false });
      
      // Get overdue borrowings
      const overdueBorrowings = await db.collection('borrowings').countDocuments({
        is_borrow: true,
        due_date: { $lt: new Date() }
      });

      return {
        total: totalBorrowings,
        active: activeBorrowings,
        returned: returnedBorrowings,
        overdue: overdueBorrowings
      };
    } catch (error) {
      throw new Error(`Failed to get borrowing stats: ${error.message}`);
    }
  }
}

module.exports = BorrowingModel; 