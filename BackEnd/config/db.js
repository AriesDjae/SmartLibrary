// const { ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');

let db;

const connectToDb = async (cb) => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGODB_URI (atau MONGO_URI) environment variable belum di-set. Silakan tambahkan di .env atau environment Anda, contoh: MONGODB_URI=mongodb://localhost:27017/smartlibrary');
    }
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(); //Jika berhasil: menyimpan akses ke gudang data dalam variabel 'db'
    cb();
  } catch (err) {
    console.error('DB Connection Error:', err);
    cb(err);
  }
};

const getDb = () => db;

module.exports = { connectToDb, getDb };
