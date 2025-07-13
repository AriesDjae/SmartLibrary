// Routing untuk user_interactions
const express = require('express');
const router = express.Router();
const { getUserInteractions, postUserInteraction, getCurrentlyReading, getWeeklyReadingStats } = require('../controllers/userInteractionController');

// GET: Ambil interaksi user (bisa filter user_id, book_id, atau keduanya)
router.get('/', getUserInteractions);
// POST: Tambah interaksi user
router.post('/', postUserInteraction);
router.get('/weekly-stats', getWeeklyReadingStats);

module.exports = router; 

//GET /api/user-interactions: Ambil data interaksi (bisa filter user_id, book_id, atau keduanya).
//POST /api/user-interactions: Tambah data interaksi baru.