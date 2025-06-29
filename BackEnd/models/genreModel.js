const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class GenreModel {
  // Ambil semua genre
  static async findAll() {
    const db = getDb();
    return db.collection('genres').find().toArray();
  }

  // Ambil genre berdasarkan id
  static async findById(id) {
    const db = getDb();
    return db.collection('genres').findOne({ _id: typeof id === 'string' ? ObjectId(id) : id });
  }
}

module.exports = GenreModel; 