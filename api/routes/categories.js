const express = require('express');
const Category = require('../models/Category');
const { protect, restrictTo } = require('../middlewares/auth');
const { categorySchema, validate } = require('../validation/schemas');
const { auditMiddleware, captureOriginalData } = require('../middlewares/audit');
const router = express.Router();

// All routes are protected
router.use(protect);

// Get all categories (all roles)
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find();
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// Get single category (all roles)
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// Create category (MANAGER and ADMIN only)
router.post('/',
  restrictTo('ADMIN', 'MANAGER'),
  validate(categorySchema),
  auditMiddleware('CREATE', 'Category'),
  async (req, res, next) => {
    try {
      const category = await Category.create(req.body);

      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update category (MANAGER and ADMIN only)
router.put('/:id',
  restrictTo('ADMIN', 'MANAGER'),
  captureOriginalData(Category),
  auditMiddleware('UPDATE', 'Category'),
  async (req, res, next) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete category (MANAGER and ADMIN only)
router.delete('/:id',
  restrictTo('ADMIN', 'MANAGER'),
  captureOriginalData(Category),
  auditMiddleware('DELETE', 'Category'),
  async (req, res, next) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
