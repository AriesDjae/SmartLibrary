// Controller untuk user_interactions
const { getDb } = require('../config/db');
const { findInteractions, addInteraction } = require('../models/userInteractionModel');

// Mendapatkan interaksi berdasarkan filter user_id, book_id, atau keduanya, lalu join ke data user & book
const getUserInteractions = async (req, res) => {
  try {
    const db = getDb();
    const { user_id, book_id } = req.query;
    // Siapkan filter
    let match = {};
    if (user_id) match.user_id = user_id;
    if (book_id) match.book_id = book_id;

    // Aggregation pipeline untuk join ke koleksi user & books
    const pipeline = [
      { $match: match },
      // Join ke koleksi user
      { $lookup: {
          from: 'user',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user_detail'
      }},
      // Join ke koleksi books
      { $lookup: {
          from: 'books',
          localField: 'book_id',
          foreignField: '_id',
          as: 'book_detail'
      }},
      // Unwind agar user_detail & book_detail jadi objek, bukan array
      { $unwind: { path: '$user_detail', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$book_detail', preserveNullAndEmptyArrays: true } }
    ];

    const interactions = await db.collection('user_interactions').aggregate(pipeline).toArray();
    console.log('GET user_interactions (with join):', match, 'Jumlah:', interactions.length);
    res.status(200).json(interactions);
  } catch (err) {
    console.error('Error GET user_interactions (with join):', err);
    res.status(500).json({ error: 'Gagal mengambil data interaksi user (join)' });
  }
};

// Menambah interaksi baru
const postUserInteraction = async (req, res) => {
  try {
    const interaction = req.body;
    // Validasi sederhana
    if (!interaction.user_id || !interaction.book_id || !interaction.interaction_type) {
      return res.status(400).json({ error: 'user_id, book_id, dan interaction_type wajib diisi' });
    }
    const result = await addInteraction(interaction);
    console.log('POST user_interaction:', result.insertedId);
    res.status(201).json({ message: 'Interaksi berhasil ditambahkan', id: result.insertedId });
  } catch (err) {
    console.error('Error POST user_interaction:', err);
    res.status(500).json({ error: 'Gagal menambah interaksi user' });
  }
};

module.exports = { getUserInteractions, postUserInteraction }; 