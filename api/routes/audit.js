const express = require('express');
const AuditLog = require('../models/AuditLog');
const { protect, restrictTo } = require('../middlewares/auth');
const router = express.Router();

// All routes are protected and require ADMIN role
router.use(protect);
router.use(restrictTo('ADMIN'));

// Get all audit logs with pagination
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    
    if (req.query.action) {
      filter.action = req.query.action;
    }
    
    if (req.query.resource) {
      filter.resource = req.query.resource;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.timestamp = {};
      if (req.query.startDate) {
        filter.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.timestamp.$lte = new Date(req.query.endDate);
      }
    }

    const auditLogs = await AuditLog.find(filter)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      count: auditLogs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: auditLogs
    });
  } catch (error) {
    next(error);
  }
});

// Get single audit log
router.get('/:id', async (req, res, next) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id)
      .populate('userId', 'name email');

    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    res.json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
