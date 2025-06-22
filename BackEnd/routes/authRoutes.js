const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.post('/login', authController.loginUser);

//Route untuk register user baru
router.post('/register', authController.registerUser);

//Route untuk mendapatkan semua user
router.get('/', authController.getAllUsers);

// GET user by id
router.get('/:id', authController.getUserById);

// PATCH update user by id
router.patch('/:id', authController.updateUser);

// DELETE user by id
router.delete('/:id', authController.deleteUser);

module.exports = router;