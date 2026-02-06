const express = require('express');
const User = require('../models/User');
const { protect, restrictTo } = require('../middlewares/auth');
const { userSchema, validate } = require('../validation/schemas');
const router = express.Router();

// All routes are protected and require ADMIN role
router.use(protect);
router.use(restrictTo('ADMIN'));

// Get all users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash -mfaSecret');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// Get single user
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -mfaSecret');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Create user
router.post('/', validate(userSchema), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || 'VIEWER'
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-passwordHash -mfaSecret');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
