// controllers/bookController.js
// Ahli Strategis yang sudah bekerja sama dengan Arsitek Data

const BookModel = require('../models/bookModel');
const { getDb } = require('../config/db');

// Get all books dengan fitur advanced
const getAllBooks = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 100,
      sortBy: req.query.sortBy || 'author',
      sortOrder: req.query.sortOrder === 'desc' ? -1 : 1,
      genre: req.query.genre,
      author: req.query.author,
      search: req.query.search
    };

    const result = await BookModel.findAll(options);
    
    // Mapping _id ke id
    const books = result.books.map(b => ({ id: b._id, ...b, _id: undefined }));
    res.status(200).json({
      success: true,
      data: books,
      pagination: result.pagination,
      message: `Found ${books.length} books`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Could not fetch books',
      details: error.message
    });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const book = await BookModel.getBookWithGenres(req.params.id);
    if (book) {
      // Mapping _id ke id
      const { _id, ...rest } = book;
      res.status(200).json({
        success: true,
        data: { id: _id, ...rest },
        message: 'Book found successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Book not found',
        details: 'No book found with the given ID'
      });
    }
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('Invalid') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: 'Could not fetch the book',
      details: error.message
    });
  }
};

// Create new book
const createBook = async (req, res) => {
  try {
    const newBook = await BookModel.create(req.body);
    
    res.status(201).json({
      success: true,
      data: newBook,
      message: 'Book created successfully'
    });
  } catch (error) {
    const statusCode = error.message.includes('Validation failed') ? 400 :
                      error.message.includes('already exists') ? 409 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: 'Could not create book',
      details: error.message
    });
  }
};

// Update book
const updateBook = async (req, res) => {
  try {
    const updatedBook = await BookModel.updateById(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: updatedBook,
      message: 'Book updated successfully'
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('Validation failed') ? 400 :
                      error.message.includes('Invalid') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: 'Could not update book',
      details: error.message
    });
  }
};

// Update genres untuk sebuah buku
const updateBookGenres = async (req, res) => {
  try {
    // 1. Ambil bookId dari parameter URL
    const bookId = req.params.id;

    // 2. Ambil array genreIds dari body request
    //    Pastikan frontend mengirim: { "genreIds": ["id1", "id2", ...] }
    const { genreIds } = req.body;

    // 3. Validasi input
    if (!Array.isArray(genreIds) || genreIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'genreIds harus berupa array dan tidak boleh kosong'
      });
    }

    // 4. Panggil fungsi model untuk update relasi genre
    const result = await BookModel.updateBookGenres(bookId, genreIds);

    // 5. Kirim response sukses
    res.status(200).json({
      success: true,
      message: 'Book genres updated successfully',
      data: result
    });
  } catch (error) {
    // 6. Tangani error
    res.status(500).json({
      success: false,
      error: 'Could not update book genres',
      details: error.message
    });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const result = await BookModel.deleteById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('Invalid') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: 'Could not delete book',
      details: error.message
    });
  }
};

// Get books by author - Fitur tambahan
const getBooksByAuthor = async (req, res) => {
  try {
    const books = await BookModel.findByAuthor(req.params.author);
    
    res.status(200).json({
      success: true,
      data: books,
      message: `Found ${books.length} books by ${req.params.author}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Could not fetch books by author',
      details: error.message
    });
  }
};

// Get recent books - Fitur tambahan
const getRecentBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const books = await BookModel.findRecent(limit);
    
    res.status(200).json({
      success: true,
      data: books,
      message: `Found ${books.length} recent books`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Could not fetch recent books',
      details: error.message
    });
  }
};

// Get book statistics - Fitur tambahan
const getBookStats = async (req, res) => {
  try {
    const stats = await BookModel.getStats();
    
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Book statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Could not fetch book statistics',
      details: error.message
    });
  }
};

// Get featured books
const getFeaturedBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    let books = await BookModel.findFeatured(limit);
    // Mapping _id ke id
    books = books.map(b => ({ id: b._id, ...b, _id: undefined }));
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get popular books
const getPopularBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    let books = await BookModel.findPopular(limit);
    books = books.map(b => ({ id: b._id, ...b, _id: undefined }));
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get new arrivals
const getNewArrivals = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    let books = await BookModel.findNewArrivals(limit);
    books = books.map(b => ({ id: b._id, ...b, _id: undefined }));
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// aulira
const getAllBooksWithGenres = async (req, res) => {
  try {
    const books = await BookModel.findAllWithGenres();
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
//^^

// Get comprehensive admin dashboard statistics
const getAdminDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard statistics...');
    
    const db = getDb();
    
    // Get total books
    const totalBooks = await db.collection('books').countDocuments();
    
    // Get total users
    const totalUsers = await db.collection('users').countDocuments();
    
    // Get active loans (borrowings that are not returned)
    const activeLoans = await db.collection('borrowings').countDocuments({
      return_date: { $exists: false }
    });
    
    // Get overdue books (borrowings past due date)
    const overdueBooks = await db.collection('borrowings').countDocuments({
      return_date: { $exists: false },
      due_date: { $lt: new Date() }
    });
    
    // Get monthly reads (books borrowed this month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyReads = await db.collection('borrowings').countDocuments({
      borrow_date: { $gte: currentMonth }
    });
    
    // Get average reading time per user
    const userReadingStats = await db.collection('users').aggregate([
      {
        $group: {
          _id: null,
          avgReadingTime: { $avg: '$reading_time' || 0 },
          totalReadingTime: { $sum: '$reading_time' || 0 }
        }
      }
    ]).toArray();
    
    const avgReadingTime = userReadingStats[0]?.avgReadingTime || 0;
    
    // Get popular categories
    const popularCategories = await db.collection('books').aggregate([
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();
    
    // Get recent activities (borrowings in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivities = await db.collection('borrowings').aggregate([
      {
        $match: {
          borrow_date: { $gte: sevenDaysAgo }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'books',
          localField: 'book_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      {
        $project: {
          _id: 1,
          borrow_date: 1,
          due_date: 1,
          return_date: 1,
          userName: { $arrayElemAt: ['$user.full_name', 0] },
          bookTitle: { $arrayElemAt: ['$book.title', 0] }
        }
      },
      { $sort: { borrow_date: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    // Get user engagement levels
    const userEngagement = await db.collection('users').aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: { $gte: ['$books_read', 10] },
              then: 'High',
              else: {
                $cond: {
                  if: { $gte: ['$books_read', 5] },
                  then: 'Medium',
                  else: 'Low'
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    // Calculate percentages for user engagement
    const totalEngagementUsers = userEngagement.reduce((sum, item) => sum + item.count, 0);
    const userEngagementWithPercentage = userEngagement.map(item => ({
      level: item._id,
      count: item.count,
      percentage: Math.round((item.count / totalEngagementUsers) * 100)
    }));
    
    // Get reading trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const readingTrends = await db.collection('borrowings').aggregate([
      {
        $match: {
          borrow_date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$borrow_date' },
            month: { $month: '$borrow_date' }
          },
          books: { $sum: 1 },
          users: { $addToSet: '$user_id' }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          books: 1,
          users: { $size: '$users' }
        }
      },
      { $sort: { month: 1 } }
    ]).toArray();
    
    const stats = {
      totalBooks,
      totalUsers,
      activeLoans,
      overdueBooks,
      monthlyReads,
      avgReadingTime: Math.round(avgReadingTime),
      popularCategories,
      recentActivities,
      userEngagement: userEngagementWithPercentage,
      readingTrends
    };
    
    console.log('✅ Admin dashboard stats retrieved:', {
      totalBooks,
      totalUsers,
      activeLoans,
      overdueBooks,
      monthlyReads
    });
    
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Admin dashboard statistics retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching admin dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Could not fetch admin dashboard statistics',
      details: error.message
    });
  }
};

const countBooks = async (req, res) => {
  try {
    const db = getDb();
    const count = await db.collection('books').countDocuments();
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBooksByAuthor,
  getRecentBooks,
  getBookStats,
  updateBookGenres,
  getFeaturedBooks,
  getPopularBooks,
  getNewArrivals,
  getAllBooksWithGenres,
  getAdminDashboardStats,
  countBooks
  
};