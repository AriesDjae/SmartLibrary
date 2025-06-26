// controllers/bookController.js
// Ahli Strategis yang sudah bekerja sama dengan Arsitek Data

const BookModel = require('../models/bookModel');

// Get all books dengan fitur advanced
const getAllBooks = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 1000,
      sortBy: req.query.sortBy || 'author',
      sortOrder: req.query.sortOrder === 'desc' ? -1 : 1,
      genre: req.query.genre,
      author: req.query.author,
      search: req.query.search
    };

    const result = await BookModel.findAll(options);
    
    res.status(200).json({
      success: true,
      data: result.books,
      pagination: result.pagination,
      message: `Found ${result.books.length} books`
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
    res.status(200).json({
      success: true,
      data: book,
      message: 'Book found successfully'
    });
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

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBooksByAuthor,
  getRecentBooks,
  getBookStats,
  updateBookGenres
};