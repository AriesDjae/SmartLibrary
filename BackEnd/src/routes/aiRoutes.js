const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// Mendapatkan rekomendasi buku
router.get('/recommendations', auth, aiController.getRecommendations);

// Update preferensi user
router.put('/preferences/:userId', auth, aiController.updateUserPreferences);

// Chat dengan AI
router.post('/chat', auth, aiController.chat);

module.exports = router; 