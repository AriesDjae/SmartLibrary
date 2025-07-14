// models/bookModel.js
// Arsitek Data - Master Blueprint untuk semua hal tentang buku

const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class BookModel {
  // Blueprint struktur data buku
  static schema = {
    title: { type: 'string', required: true, maxLength: 100 },
    author: { type: 'string', required: true, maxLength: 50 },
    coverImage: { type: 'string', required: true }, 
    description: { type: 'string', required: true, maxLength: 500 },
    publishDate: { type: 'string', required: true }, 
    pageCount: { type: 'number', required: true, min: 1 },
    isbn: { type: 'string', required: true },
    isAvailable: { type: 'boolean', required: true },
    isPopular: { type: 'boolean', required: true }
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

      // Validasi coverImage
    if (bookData.coverImage !== undefined && typeof bookData.coverImage !== 'string') {
      errors.push('Cover image must be a string');
    }

    // Validasi description (optional)
    if (bookData.description !== undefined) {
      if (typeof bookData.description !== 'string') {
        errors.push('Description must be a string');
      } else if (bookData.description.length > 500) {
        errors.push('Description must be less than 500 characters');
      }
    }

    // Validasi publishDate (optional)
    if (bookData.publishDate !== undefined && typeof bookData.publishDate !== 'string') {
      errors.push('Publish date must be a string');
    }

    // Validasi pages (optional)
    if (bookData.pages !== undefined) {
      if (typeof bookData.pages !== 'number') {
        errors.push('Pages must be a number');
      } else if (bookData.pages < 1) {
        errors.push('Pages must be at least 1');
      }
    }

    // Validasi ISBN (optional)
    if (bookData.isbn !== undefined) {
      if (typeof bookData.isbn !== 'string') {
        errors.push('ISBN must be a string');
      } else if (![10, 13].includes(bookData.isbn.length)) {
        errors.push('ISBN must be 10 or 13 characters');
      }
    }

    // Validasi isAvailable (optional)
    if (bookData.isAvailable !== undefined && typeof bookData.isAvailable !== 'boolean') {
      errors.push('isAvailable must be a boolean');
    }

    // Validasi isPopular (optional)
    if (bookData.isPopular !== undefined && typeof bookData.isPopular !== 'boolean') {
      errors.push('isPopular must be a boolean');
    }

    return errors;
  }

  // Sanitize data sebelum disimpan
  static sanitize(bookData) {
    const sanitized = {};
  
    if (bookData.title) sanitized.title = bookData.title.trim();
    if (bookData.author) sanitized.author = bookData.author.trim();
    if (bookData.coverImage) sanitized.coverImage = bookData.coverImage.trim();
    if (bookData.description) sanitized.description = bookData.description.trim();
    if (bookData.publishDate) sanitized.publishDate = bookData.publishDate.trim();
    if (bookData.pageCount) sanitized.pageCount = parseInt(bookData.pageCount);
    if (bookData.isbn) sanitized.isbn = bookData.isbn.trim();
    if (typeof bookData.isAvailable === 'boolean') sanitized.isAvailable = bookData.isAvailable;
    if (typeof bookData.isPopular === 'boolean') sanitized.isPopular = bookData.isPopular;
  
    sanitized.updatedAt = new Date();
    if (!bookData.createdAt) sanitized.createdAt = new Date();
  
    return sanitized;
  }

  // Fungsi validasi ID buku: hanya cek id harus string dan tidak kosong
  static isValidBookId(id) {
    return typeof id === 'string' && id.trim().length > 0;
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
      if (!this.isValidBookId(id)) {
        throw new Error('Invalid book ID format');
      }
      // Query dengan string id
      const book = await db.collection('books').findOne({ _id: id });
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
      if (!this.isValidBookId(id)) {
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
      // Query dengan string id
      const result = await db.collection('books').updateOne({ _id: id }, { $set: sanitizedData });
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
      if (!this.isValidBookId(id)) {
        throw new Error('Invalid book ID format');
      }
      // Query dengan string id
      const result = await db.collection('books').deleteOne({ _id: id });
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

  
  // Ambil semua buku beserta nama genre
  static async findAllWithGenres() {
    const db = getDb();
    // Aggregation pipeline untuk join ke book_genres dan genres
    return db.collection('books').aggregate([
      {
        $lookup: {
          from: 'book_genres',
          localField: '_id',
          foreignField: 'books_id',
          as: 'book_genres'
        }
      },
      {
        $lookup: {
          from: 'genres',
          localField: 'book_genres.genres_id',
          foreignField: '_id',
          as: 'genresArr'
        }
      },
      {
        $addFields: {
          genres: {
            $map: {
              input: '$genresArr',
              as: 'g',
              in: '$$g.genres_name'
            }
          }
        }
      },
      {
        $project: {
          genresArr: 0,
          book_genres: 0
        }
      }
    ]).toArray();
  }
 

  // Get book with genres
  static async getBookWithGenres(bookId){
    const db = getDb();
    if (!this.isValidBookId(bookId)) {
      throw new Error('Invalid book ID format');
    }
    //1. Ambil data buku
    const book = await db.collection('books').findOne({ _id: bookId });
    if (!book) throw new Error("Book not found");
    //2. Ambil semua genres_id dari book_genres (books_id = string)
    const bookGenres = await db.collection('book_genres').find({ books_id: bookId }).toArray();
    //3. Ambil array genres_id (ObjectId)
    const genreIds = bookGenres.map(bg => bg.genres_id);
    //4. Query ke koleksi genres (field: genres_name)
    const genres = genreIds.length > 0
      ? await db.collection('genres').find({ _id: { $in: genreIds } }).toArray()
      : [];
    //5. Gabungkan data buku dan array nama genre
    console.log("bookGenres:", bookGenres);
    console.log("genreIds:", genreIds);
    console.log("genres:", genres);
    return {
      ...book,
      genres: genres.map(g => g.genres_name)
    }
  }

  // Update book genres
  static async updateBookGenres(bookId, newGenreIds){
    const db = getDb();
    if (!this.isValidBookId(bookId)) {
      throw new Error('Invalid book ID format');
    }
    //1. hapus semua relasi lama
    await db.collection('book_genres').deleteMany({ books_id: bookId });
    //2. tambahkan relasi baru
    const newBookGenres = newGenreIds.map(genreId => ({
      books_id : bookId,
      genres_id : genreId
    }));
    await db.collection('book_genres').insertMany(newBookGenres);
    return { message: "Book genres updated" };
  }

  // Delete book and genres
  static async  deleteBookAndGenres(bookId) {
    const db = getDb();
    if (!this.isValidBookId(bookId)) {
      throw new Error('Invalid book ID format');
    }
    // 1. Hapus buku
    await db.collection('books').deleteOne({ _id: bookId });
    // 2. Hapus semua relasi genre
    await db.collection('book_genres').deleteMany({ books_id: bookId });
    return { message: "Book and its genres deleted" };
  }



// Get featured books
static async findFeatured(limit = 10) {
  const db = getDb();

  //1.Hitung rata-rata rating tiap buku
  const topRated = await db.collection('ratings').aggregate([
    {
      $group: {
        _id: "$book_id",  //Mengelompokkan berdasarkan book_id
        avgRating: { $avg: "$rating_value" }, //Menghitung rata-rata rating dan jumlah total rating per buku
        count: { $sum: 1 }
      }
    },
    { $sort: { avgRating: -1, count: -1 } }, // urutkan rating tertinggi, lalu jumlah rating terbanyak
    { $limit: limit }
  ]).toArray();

  // 2. Ambil daftar book_id
  const bookIds = topRated.map(r => r._id);

  // 3. Ambil detail buku dari koleksi books
  const books = await db.collection('books')
    .find({ _id: { $in: bookIds } })
    .toArray();
  
  // 4. Gabungkan data rating ke data buku
  const booksWithRating = books.map(book => {
    const ratingInfo = topRated.find(r => r._id === book._id);
    return {
      ...book,
      avgRating: ratingInfo ? ratingInfo.avgRating : null,
      ratingCount: ratingInfo ? ratingInfo.count : 0
      .find({ isPopular: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    };
  });

  return booksWithRating;
}

// Get popular books
static async findPopular(limit = 10) {
  const db = getDb();
  return await db.collection('books')
    .find({ isPopular: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

// Get new arrivals
static async findNewArrivals(limit = 10) {
  const db = getDb();
  return await db.collection('books')
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}
}

module.exports = BookModel;