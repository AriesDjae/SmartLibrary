// server.js
// Sutradara Utama yang semakin profesional

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectToDb, getDb } = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
// const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 3000;
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
      // users: '/users',
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
app.use('/books', bookRoutes);
// app.use('/users', userRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: ['/books', '/health', '/api']
    // availableEndpoints: ['/books', '/users', '/health', '/api']
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
    console.log(`✅ Database: Connected to ${process.env.MONGO_URI}`);
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





























// require('dotenv').config();
// const express = require('express');
// const { connectToDb, getDb } = require('./config/db');
// const bookRoutes = require('./routes/bookRoutes');
// const userRoutes = require('./routes/userRoutes');


// const app = express();
// const port = process.env.PORT || 3000;

// app.use(express.json());
// app.use('/books', bookRoutes);
// app.use('/api/users', userRoutes); 

// connectToDb(() => {
//   app.listen(port, () => {
//     console.log("✅ MONGO_URI:", process.env.MONGO_URI);

//     console.log(`Server berjalan di http://localhost:${port}`);
//   });
// });





















