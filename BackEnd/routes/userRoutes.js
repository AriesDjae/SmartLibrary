const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/count-nonadmin', userController.countNonAdminUsers);
router.get('/avg-reading-time', userController.avgReadingTimeNonAdmin);

module.exports = router;