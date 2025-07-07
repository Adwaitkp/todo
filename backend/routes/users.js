const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users (username and _id)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 