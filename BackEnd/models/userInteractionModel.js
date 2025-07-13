// Model untuk mengakses koleksi user_interactions
// Menggunakan MongoDB native driver
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

// Fungsi untuk mengambil interaksi berdasarkan filter
const findInteractions = async (filter = {}) => {
  try {
    const db = getDb();
    // Query ke koleksi user_interactions dengan filter
    const interactions = await db.collection('user_interactions').find(filter).toArray();
    console.log('Berhasil mengambil data interaksi:', interactions.length);
    return interactions;
  } catch (err) {
    console.error('Gagal mengambil data interaksi:', err);
    throw err;
  }
};

// Fungsi untuk menambah interaksi baru
const addInteraction = async (interaction) => {
  try {
    const db = getDb();
    // Insert dokumen baru ke koleksi user_interactions
    const result = await db.collection('user_interactions').insertOne(interaction);
    console.log('Berhasil menambah interaksi:', result.insertedId);
    return result;
  } catch (err) {
    console.error('Gagal menambah interaksi:', err);
    throw err;
  }
};

module.exports = { findInteractions, addInteraction }; 