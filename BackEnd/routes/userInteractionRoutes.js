// Routing untuk user_interactions
const express = require('express');
const router = express.Router();
const { getUserInteractions, postUserInteraction } = require('../controllers/userInteractionController');

// GET: Ambil interaksi user (bisa filter user_id, book_id, atau keduanya)
router.get('/', getUserInteractions);
// POST: Tambah interaksi user
router.post('/', postUserInteraction);

module.exports = router; 

//GET /api/user-interactions: Ambil data interaksi (bisa filter user_id, book_id, atau keduanya).
//POST /api/user-interactions: Tambah data interaksi baru.