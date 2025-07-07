const express = require('express');
const router = express.Router();
const ActionLog = require('../models/ActionLog');
const jwt = require('jsonwebtoken');

// Auth middleware
function auth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token.' });
  }
}

// Get last 20 actions
router.get('/', auth, async (req, res) => {
  try {
    const actions = await ActionLog.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('user', 'username')
      .populate('task', 'title');
    res.json(actions);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 