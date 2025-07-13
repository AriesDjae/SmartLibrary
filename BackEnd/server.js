// server.js
// Sutradara Utama yang semakin profesional

require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI); // debug
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectToDb, getDb } = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const genreRoutes = require('./routes/genreRoutes');
const userInteractionRoutes = require('./routes/userInteractionRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');


const app = express();
const port = process.env.PORT || 3001;
const environment = process.env.NODE_ENV || 'development';

// Security Middleware
app.use(helmet()); // Set security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Logging Middleware
if (environment === 'development') {
  app.use(morgan('dev')); // Detailed logging for development
} else {
  app.use(morgan('combined')); // Standard logging for production
}

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Timestamp Middleware
app.use((req, res, next) => {
  req.timestamp = new Date().toISOString();
  next();
});

// Rate Limiting (basic implementation)
const requestCounts = {};
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

app.use((req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts[clientIp]) {
    requestCounts[clientIp] = { count: 1, resetTime: now + RATE_WINDOW };
  } else if (now > requestCounts[clientIp].resetTime) {
    requestCounts[clientIp] = { count: 1, resetTime: now + RATE_WINDOW };
  } else {
    requestCounts[clientIp].count++;
  }

  if (requestCounts[clientIp].count > RATE_LIMIT) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }

  next();
});

// Health Check Route
app.get('/health', (req, res) => {
  const db = getDb();
  res.status(200).json({
    success: true,
    service: 'Book Management API',
    status: 'healthy',
    environment: environment,
    timestamp: req.timestamp,
    database: db ? 'connected' : 'disconnected',
    version: '2.0.0'
  });
});

// API Info Route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Book Management API',
    version: '2.0.0',
    endpoints: {
      books: '/books',
      user: '/users',
      health: '/health'
    },
    documentation: {
      books: {
        'GET /books': 'Get all books with pagination and filtering',
        'GET /books/:id': 'Get book by ID',
        'POST /books': 'Create new book',
        'PATCH /books/:id': 'Update book',
        'DELETE /books/:id': 'Delete book',
        'GET /books/author/:author': 'Get books by author',
        'GET /books/recent/list': 'Get recent books',
        'GET /books/stats/summary': 'Get book statistics',
        'GET /books/meta/genres': 'Get available genres',
        'GET /books/health/check': 'Book service health check'
      }
    },
    queryParameters: {
      'GET /books': {
        page: 'Page number (default: 0)',
        limit: 'Items per page (default: 5)',
        sortBy: 'Sort field (default: author)',
        sortOrder: 'asc or desc (default: asc)',
        genre: 'Filter by genre',
        author: 'Filter by author name',
        search: 'Search in title and author'
      }
    }
  });
});

// API Routes
app.use('/api/books', bookRoutes);
app.use('/api/users', authRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/user-interactions', userInteractionRoutes);
app.use('/api/borrowings', borrowingRoutes);
console.log('Route /api/user-interactions siap digunakan');
console.log('Route /api/borrowings siap digunakan');
// router.put('/books/:id/genres', bookController.updateBookGenres);


// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: ['/books', '/users', '/health', '/api']
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('🚨 Global Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: req.timestamp
  });

  res.status(error.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: environment === 'development' ? error.message : 'Something went wrong',
    timestamp: req.timestamp
  });
});

// Graceful Shutdown Handler
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Database Connection and Server Start
connectToDb((err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log('\n🚀 ================================');
    console.log('📚 BOOK MANAGEMENT API STARTED');
    console.log('🚀 ================================');
    console.log(`✅ Environment: ${environment}`);
    console.log(`✅ Server: http://localhost:${port}`);
    console.log(`✅ Health Check: http://localhost:${port}/health`);
    console.log(`✅ API Documentation: http://localhost:${port}/api`);
    console.log('🚀 ================================\n');

    // Test database connection
    const db = getDb();
    if (db) {
      console.log('📊 Database collections available:');
      db.listCollections().toArray()
        .then(collections => {
          collections.forEach(col => console.log(`   - ${col.name}`));
        })
        .catch(err => console.log('   Could not list collections:', err.message));
    }
  });
});













































// //framework untuk buat server di Node.js
// const express = require('express');
// const cors = require('cors');
// // const { ObjectId } = require('mongodb');
// // const { connectToDb, getDb } = require('./db');
// const peminjamanRoutes = require('./routes/peminjaman');
// // const aiRoutes = require('./src/routes/aiRoutes');

// //baca file .env
// require('dotenv').config();

// // // //untuk konek dan berinteraksi dengan MongoDB
// // // const mongoose = require('mongoose');

// //Inisialisasi aplikasi Express
// const app = express();

// // // //port untuk server
// const port = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ error: 'Something went wrong!' });
// });

// // ===================== ROUTES =====================

// // Nonaktifkan koneksi database sementara (in-memory only)
// // let db;
// // connectToDb((err) => {
// //     if (err) {
// //         console.error('Database connection error:', err);
// //         return;
// //     }
// //
// //     app.listen(port, () => {
// //         console.log(`Server berjalan di http://localhost:${port}`);
// //     });
// //     db = getDb();
// // });

// // Jalankan server langsung tanpa database
// app.listen(port, () => {
//     console.log(`Server berjalan di http://localhost:${port}`);
// });

// // Books Routes (DISABLED - membutuhkan database)
// // app.get('/api/books', ...)
// // app.get('/api/books/:id', ...)
// // app.post('/api/books', ...)
// // app.delete('/api/books/:id', ...)
// // app.patch('/api/books/:id', ...)

// // AI Routes
// app.post('/api/ai/chat', async (req, res) => {
//     try {
//         const { message } = req.body;
//         if (!message) {
//             return res.status(400).json({ error: 'Message is required' });
//         }

//         // Simulasi respons AI sederhana
//         const response = {
//             message: `Ini adalah respons AI untuk: "${message}"`,
//             timestamp: new Date()
//         };

//         res.status(200).json(response);
//     } catch (error) {
//         console.error('Error in AI chat:', error);
//         res.status(500).json({ error: 'Failed to process AI request' });
//     }
// });

// // Routes
// app.use(peminjamanRoutes);
