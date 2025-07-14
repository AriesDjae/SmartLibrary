const { getDb } = require('../config/db');

exports.countNonAdminUsers = async (req, res) => {
  try {
    const db = getDb();
    const count = await db.collection('user').countDocuments({ role_id: { $ne: 'r2' } });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.avgReadingTimeNonAdmin = async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection('user').aggregate([
      { $match: { role_id: { $ne: 'r2' } } },
      { $group: { _id: null, avg: { $avg: '$reading_time' } } }
    ]).toArray();
    res.json({ success: true, avg: result[0]?.avg || 0 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};