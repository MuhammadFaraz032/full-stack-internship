const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update background
router.put('/background', protect, async (req, res) => {
  try {
    const { background } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { background },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add custom background
router.post('/background/custom', protect, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const user = await User.findById(req.user.id);

    if (user.customBackgrounds.length >= 5) {
      return res.status(400).json({ message: 'Maximum 5 custom backgrounds allowed' });
    }

    user.customBackgrounds.push(imageBase64);
    user.background = imageBase64;
    await user.save();

    res.json({ customBackgrounds: user.customBackgrounds, background: user.background });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete custom background
router.delete('/background/custom/:index', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.customBackgrounds.splice(req.params.index, 1);
    if (user.background === user.customBackgrounds[req.params.index]) {
      user.background = 'default';
    }
    await user.save();
    res.json({ customBackgrounds: user.customBackgrounds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;