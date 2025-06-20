// models/bookModel.js
// Sang Arsitek Data - Master Blueprint untuk semua hal tentang buku

const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class BookModel {
  // Blueprint struktur data buku
  static schema = {
    title: { type: 'string', required: true, maxLength: 100 },
    author: { type: 'string', required: true, maxLength: 50 },
    publishedYear: { type: 'number', min: 1000, max: new Date().getFullYear() },
    pages: { type: 'number', min: 1 },
    genre: { 
      type: 'string', 
      enum: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Fantasy', 'Mystery', 'Romance']
    },
    isbn: { type: 'string', pattern: /^(?:\d{10}|\d{13})$/ },
    description: { type: 'string', maxLength: 500 },
    price: { type: 'number', min: 0 }
  };

  // Validasi data buku - Quality Control
  static validate(bookData) {
    const errors = [];
    
    // Validasi title
    if (!bookData.title) {
      errors.push('Title is required');
    } else if (typeof bookData.title !== 'string') {
      errors.push('Title must be a string');
    } else if (bookData.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (bookData.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    // Validasi author
    if (!bookData.author) {
      errors.push('Author is required');
    } else if (typeof bookData.author !== 'string') {
      errors.push('Author must be a string');
    } else if (bookData.author.trim().length === 0) {
      errors.push('Author cannot be empty');
    } else if (bookData.author.length > 50) {
      errors.push('Author must be less than 50 characters');
    }

    // Validasi publishedYear (optional)
    if (bookData.publishedYear !== undefined) {
      if (typeof bookData.publishedYear !== 'number') {
        errors.push('Published year must be a number');
      } else if (bookData.publishedYear < 1000 || bookData.publishedYear > new Date().getFullYear()) {
        errors.push(`Published year must be between 1000 and ${new Date().getFullYear()}`);
      }
    }

    // Validasi pages (optional)
    if (bookData.pages !== undefined) {
      if (typeof bookData.pages !== 'number') {
        errors.push('Pages must be a number');
      } else if (bookData.pages < 1) {
        errors.push('Pages must be at least 1');
      }
    }

    // Validasi genre (optional)
    if (bookData.genre !== undefined) {
      if (!this.schema.genre.enum.includes(bookData.genre)) {
        errors.push(`Genre must be one of: ${this.schema.genre.enum.join(', ')}`);
      }
    }

    // Validasi ISBN (optional)
    if (bookData.isbn !== undefined) {
      if (!this.schema.isbn.pattern.test(bookData.isbn)) {
        errors.push('ISBN must be 10 or 13 digits');
      }
    }

    // Validasi description (optional)
    if (bookData.description !== undefined) {
      if (typeof bookData.description !== 'string') {
        errors.push('Description must be a string');
      } else if (bookData.description.length > 500) {
        errors.push('Description must be less than 500 characters');
      }
    }

    // Validasi price (optional)
    if (bookData.price !== undefined) {
      if (typeof bookData.price !== 'number') {
        errors.push('Price must be a number');
      } else if (bookData.price < 0) {
        errors.push('Price cannot be negative');
      }
    }

    return errors;
  }

  // Sanitize data sebelum disimpan
  static sanitize(bookData) {
    const sanitized = {};
    
    if (bookData.title) sanitized.title = bookData.title.trim();
    if (bookData.author) sanitized.author = bookData.author.trim();
    if (bookData.publishedYear) sanitized.publishedYear = parseInt(bookData.publishedYear);
    if (bookData.pages) sanitized.pages = parseInt(bookData.pages);
    if (bookData.genre) sanitized.genre = bookData.genre.trim();
    if (bookData.isbn) sanitized.isbn = bookData.isbn.replace(/\D/g, ''); // Remove non-digits
    if (bookData.description) sanitized.description = bookData.description.trim();
    if (bookData.price) sanitized.price = parseFloat(bookData.price);
    
    // Tambahkan timestamp
    sanitized.createdAt = new Date();
    sanitized.updatedAt = new Date();
    
    return sanitized;
  }

  // CRUD Operations - Business Logic Layer

  // Get all books dengan pagination dan filtering
  static async findAll(options = {}) {
    const db = getDb();
    const {
      page = 0,
      limit = 5,
      sortBy = 'author',
      sortOrder = 1,
      genre,
      author,
      search
    } = options;

    let query = {};
    
    // Filter by genre
    if (genre) {
      query.genre = genre;
    }
    
    // Filter by author
    if (author) {
      query.author = new RegExp(author, 'i');
    }
    
    // Search in title and author
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') }
      ];
    }

    try {
      const books = await db.collection('books')
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(page * limit)
        .limit(limit)
        .toArray();

      const total = await db.collection('books').countDocuments(query);
      
      return {
        books,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch books: ${error.message}`);
    }
  }

  // Get book by ID
  static async findById(id) {
    const db = getDb();
    
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid book ID format');
      }
      
      const book = await db.collection('books').findOne({ _id: new ObjectId(id) });
      
      if (!book) {
        throw new Error('Book not found');
      }
      
      return book;
    } catch (error) {
      throw new Error(`Failed to fetch book: ${error.message}`);
    }
  }

  // Create new book
  static async create(bookData) {
    const db = getDb();
    
    try {
      // Validasi data
      const validationErrors = this.validate(bookData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      // Sanitize data
      const sanitizedData = this.sanitize(bookData);
      
      // Check if book with same title and author already exists
      const existingBook = await db.collection('books').findOne({
        title: sanitizedData.title,
        author: sanitizedData.author
      });
      
      if (existingBook) {
        throw new Error('Book with same title and author already exists');
      }
      
      const result = await db.collection('books').insertOne(sanitizedData);
      
      return {
        _id: result.insertedId,
        ...sanitizedData
      };
    } catch (error) {
      throw new Error(`Failed to create book: ${error.message}`);
    }
  }

  // Update book
  static async updateById(id, updateData) {
    const db = getDb();
    
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid book ID format');
      }
      
      // Validasi data update
      const validationErrors = this.validate(updateData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      // Sanitize data
      const sanitizedData = this.sanitize(updateData);
      sanitizedData.updatedAt = new Date();
      
      const result = await db.collection('books').updateOne(
        { _id: new ObjectId(id) },
        { $set: sanitizedData }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('Book not found');
      }
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update book: ${error.message}`);
    }
  }

  // Delete book
  static async deleteById(id) {
    const db = getDb();
    
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid book ID format');
      }
      
      const result = await db.collection('books').deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        throw new Error('Book not found');
      }
      
      return { message: 'Book deleted successfully', deletedCount: result.deletedCount };
    } catch (error) {
      throw new Error(`Failed to delete book: ${error.message}`);
    }
  }

  // Business Logic Methods

  // Get books by author
  static async findByAuthor(authorName) {
    const db = getDb();
    
    try {
      return await db.collection('books')
        .find({ author: new RegExp(authorName, 'i') })
        .sort({ title: 1 })
        .toArray();
    } catch (error) {
      throw new Error(`Failed to fetch books by author: ${error.message}`);
    }
  }

  // Get recent books
  static async findRecent(limit = 10) {
    const db = getDb();
    
    try {
      return await db.collection('books')
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      throw new Error(`Failed to fetch recent books: ${error.message}`);
    }
  }

  // Get book statistics
  static async getStats() {
    const db = getDb();
    
    try {
      const stats = await db.collection('books').aggregate([
        {
          $group: {
            _id: null,
            totalBooks: { $sum: 1 },
            avgPages: { $avg: '$pages' },
            minYear: { $min: '$publishedYear' },
            maxYear: { $max: '$publishedYear' }
          }
        }
      ]).toArray();

      const genreStats = await db.collection('books').aggregate([
        {
          $group: {
            _id: '$genre',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray();

      return {
        overall: stats[0] || {},
        byGenre: genreStats
      };
    } catch (error) {
      throw new Error(`Failed to fetch book statistics: ${error.message}`);
    }
  }
}

module.exports = BookModel;