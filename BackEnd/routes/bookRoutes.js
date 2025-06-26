// routes/bookRoutes.js
// Koordinator yang semakin pintar dengan routing yang lebih lengkap

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Middleware untuk validasi ID parameter
const validateObjectId = (req, res, next) => {
  const { ObjectId } = require('mongodb');
  const id = req.params.id;
  
  if (typeof req.params.id !== 'string' || req.params.id.trim() === '') {
    return res.status(400).json({ success: false, error: "Invalid ID format", details: "ID must be a non-empty string" });
  }
  
  next();
};

// Middleware untuk logging request
const logRequest = (req, res, next) => {
  console.log(`📚 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body, null, 2));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('   Query:', JSON.stringify(req.query, null, 2));
  }
  next();
};

// Apply logging middleware to all routes
router.use(logRequest);

// Basic CRUD Routes
router.get('/', bookController.getAllBooks);
router.get('/:id', validateObjectId, bookController.getBookById);
router.post('/', bookController.createBook);
router.patch('/:id', validateObjectId, bookController.updateBook);
router.put('/books/:id/genres', bookController.updateBookGenres);
router.delete('/:id', validateObjectId, bookController.deleteBook);

// Additional Feature Routes
router.get('/author/:author', bookController.getBooksByAuthor);
router.get('/recent/list', bookController.getRecentBooks);
router.get('/stats/summary', bookController.getBookStats);


// Route untuk mendapatkan semua genre yang tersedia
router.get('/meta/genres', (req, res) => {
  const BookModel = require('../models/bookModel');
  res.status(200).json({
    success: true,
    data: BookModel.schema.genre.enum,
    message: 'Available genres retrieved successfully'
  });
});

// Route untuk health check
router.get('/health/check', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Book Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Book service is running properly'
  });
});

// Error handling middleware khusus untuk book routes
router.use((error, req, res, next) => {
  console.error('📚 Book Route Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: 'Internal server error in book service',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;