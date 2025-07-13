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
      { $sort: { timestamp: -1 } }, // urutkan terbaru dulu
      { $limit: 200 }, // batasi maksimal 200 data
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

// Misal di userInteractionController.js
const getCurrentlyReading = async (req, res) => {
  const userId = req.user._id;
  // Ambil interaksi membaca terbaru untuk setiap buku
  const currentlyReading = await UserInteraction.aggregate([
    { $match: { user_id: userId, interaction_type: "read" } },
    { $sort: { timestamp: -1 } },
    { $group: {
        _id: "$book_id",
        progress: { $first: "$progress" },
        lastInteraction: { $first: "$$ROOT" }
      }
    },
    // Join ke koleksi buku jika perlu
    // { $lookup: ... }
  ]);
  res.json(currentlyReading);
};

// Endpoint: GET /api/user-interactions/weekly-stats?user_id=...
const getWeeklyReadingStats = async (req, res) => {
  try {
    const db = getDb();
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id wajib diisi' });
    
    // Always use current week/month data, no weekStart parameter
    const match = {
      user_id: user_id,
      interaction_type: 'read'
    };
    
    const weeklyStats = await db.collection('user_interactions').aggregate([
      { $match: match },
      { $sort: { timestamp: 1 } },
      {
        $lookup: {
          from: 'books',
          localField: 'book_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' },
      {
        $project: {
          dayOfWeek: { $isoDayOfWeek: { $toDate: '$timestamp' } }, // 1=Mon, 7=Sun
          pagesRead: { $multiply: ['$progress', '$book.pageCount'] },
          readingTime: { $divide: [{ $multiply: ['$progress', '$book.pageCount'] }, 0.833 ] }
        }
      },
      {
        $group: {
          _id: '$dayOfWeek',
          totalPages: { $sum: '$pagesRead' },
          totalMinutes: { $sum: '$readingTime' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    // Format hasil agar urut Senin-Minggu dan isi 0 jika tidak ada data
    const result = Array(7).fill(0).map((_, i) => {
      const found = weeklyStats.find(d => d._id === i + 1);
      return {
        day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
        readingTime: found ? Math.round(found.totalMinutes) : 0,
        pagesRead: found ? Math.round(found.totalPages) : 0
      };
    });
    res.json(result);
  } catch (err) {
    console.error('Error GET weekly reading stats:', err);
    res.status(500).json({ error: 'Gagal mengambil statistik membaca mingguan' });
  }
};

module.exports = { getUserInteractions, postUserInteraction, getCurrentlyReading, getWeeklyReadingStats }; 