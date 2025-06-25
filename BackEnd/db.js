const { MongoClient } = require('mongodb');

let db;

const connectToDb = async (cb) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
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