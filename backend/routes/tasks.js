const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ActionLog = require('../models/ActionLog');

const COLUMN_NAMES = ['Todo', 'In Progress', 'Done'];

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

// Create Task
router.post('/', auth, async (req, res) => {
  const { title, description, assignedUser, status, priority } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required.' });
  if (COLUMN_NAMES.includes(title)) return res.status(400).json({ message: 'Title cannot match column names.' });
  try {
    const existing = await Task.findOne({ title });
    if (existing) return res.status(400).json({ message: 'Title must be unique.' });
    const task = new Task({ title, description, assignedUser, status, priority });
    await task.save();
    // Log action
    const actionLog = await ActionLog.create({
      user: req.user.userId,
      action: 'create',
      task: task._id,
      details: `Created task '${title}'`
    });
    // Populate assignedUser before emitting and sending response
    const populatedTask = await Task.findById(task._id).populate('assignedUser', 'username');
    req.app.get('io').emit('taskCreated', populatedTask);
    req.app.get('io').emit('actionLogged', actionLog);
    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get All Tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedUser', 'username');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update Task
router.put('/:id', auth, async (req, res) => {
  const { title, description, assignedUser, status, priority, updatedAt } = req.body;
  if (title && COLUMN_NAMES.includes(title)) return res.status(400).json({ message: 'Title cannot match column names.' });
  try {
    if (title) {
      const existing = await Task.findOne({ title, _id: { $ne: req.params.id } });
      if (existing) return res.status(400).json({ message: 'Title must be unique.' });
    }
    const taskInDb = await Task.findById(req.params.id);
    if (!taskInDb) return res.status(404).json({ message: 'Task not found.' });
    if (updatedAt && new Date(updatedAt) < taskInDb.updatedAt) {
      // Conflict detected
      return res.status(409).json({
        message: 'Conflict detected. Task has been updated by another user.',
        serverTask: taskInDb,
        clientTask: { title, description, assignedUser, status, priority, updatedAt }
      });
    }
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedUser, status, priority, updatedAt: Date.now() },
      { new: true }
    );
    // Log action
    const actionLog = await ActionLog.create({
      user: req.user.userId,
      action: 'update',
      task: task._id,
      details: `Updated task '${task.title}'`
    });
    // Populate assignedUser before emitting and sending response
    const populatedTask = await Task.findById(task._id).populate('assignedUser', 'username');
    req.app.get('io').emit('taskUpdated', populatedTask);
    req.app.get('io').emit('actionLogged', actionLog);
    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete Task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    // Log action
    const actionLog = await ActionLog.create({
      user: req.user.userId,
      action: 'delete',
      task: req.params.id,
      details: `Deleted task '${task.title}'`
    });
    // Emit real-time events
    req.app.get('io').emit('taskDeleted', { _id: req.params.id });
    req.app.get('io').emit('actionLogged', actionLog);
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Smart Assign
router.post('/:id/smart-assign', auth, async (req, res) => {
  try {
    // Find all users
    const users = await User.find();
    if (users.length === 0) return res.status(400).json({ message: 'No users found.' });
    // Count active tasks for each user
    const counts = await Task.aggregate([
      { $match: { status: { $ne: 'Done' }, assignedUser: { $ne: null } } },
      { $group: { _id: '$assignedUser', count: { $sum: 1 } } }
    ]);
    // Map userId to count
    const userTaskCounts = {};
    counts.forEach(c => { userTaskCounts[c._id.toString()] = c.count; });
    // Find user with fewest active tasks
    let minCount = Infinity;
    let selectedUser = users[0]._id;
    users.forEach(u => {
      const count = userTaskCounts[u._id.toString()] || 0;
      if (count < minCount) {
        minCount = count;
        selectedUser = u._id;
      }
    });
    // Assign task
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedUser: selectedUser, updatedAt: Date.now() },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    // Log action
    const actionLog = await ActionLog.create({
      user: req.user.userId,
      action: 'smart-assign',
      task: task._id,
      details: `Smart assigned to user '${selectedUser}'`
    });
    // Populate assignedUser before emitting and sending response
    const populatedTask = await Task.findById(task._id).populate('assignedUser', 'username');
    req.app.get('io').emit('taskUpdated', populatedTask);
    req.app.get('io').emit('actionLogged', actionLog);
    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 