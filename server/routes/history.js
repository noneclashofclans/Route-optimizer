const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const RouteHistory = require('../models/RouteHistory');

const decodeUser = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ message: 'No token' }); return null; }
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch {
    res.status(401).json({ message: 'Invalid token' });
    return null;
  }
};


router.post('/', async (req, res) => {
  const user = decodeUser(req, res);
  if (!user) return;
  try {
    const { from, to, stops, routes } = req.body;
    const entry = await RouteHistory.create({
      userId: user._id,
      from, to,
      stops: stops || [],
      routes: routes || [],
    });
    res.json({ success: true, id: entry._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save history' });
  }
});


router.get('/', async (req, res) => {
  const user = decodeUser(req, res);
  if (!user) return;
  try {
    const history = await RouteHistory.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});


router.delete('/:id', async (req, res) => {
  const user = decodeUser(req, res);
  if (!user) return;
  try {
    await RouteHistory.deleteOne({ _id: req.params.id, userId: user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

module.exports = router;