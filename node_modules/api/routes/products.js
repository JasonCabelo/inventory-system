const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middlewares/auth');
const { productSchema, validate } = require('../validation/schemas');
const { auditMiddleware, captureOriginalData } = require('../middlewares/audit');
const connectDB = require('../db');

const router = express.Router();

// Middleware to ensure database connection for serverless
const ensureDBConnection = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
      if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ message: 'Failed to connect to database. Please check MONGODB_URI environment variable.' });
      }
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ message: 'Database connection failed. Please check MONGODB_URI environment variable.' });
  }
};

// Apply DB connection middleware to all routes
router.use(ensureDBConnection);

// All routes are protected
router.use(protect);

// Get all products (all roles)
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .populate('supplier', 'name');
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// Get single product (all roles)
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('supplier', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// Create product (MANAGER and ADMIN only)
router.post('/', 
  restrictTo('ADMIN', 'MANAGER'),
  validate(productSchema),
  auditMiddleware('CREATE', 'Product'),
  async (req, res, next) => {
    try {
      const product = await Product.create(req.body);
      
      const populatedProduct = await Product.findById(product._id)
        .populate('category', 'name')
        .populate('supplier', 'name');

      res.status(201).json({
        success: true,
        data: populatedProduct
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update product (MANAGER and ADMIN only)
router.put('/:id',
  restrictTo('ADMIN', 'MANAGER'),
  captureOriginalData(Product),
  auditMiddleware('UPDATE', 'Product'),
  async (req, res, next) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      )
        .populate('category', 'name')
        .populate('supplier', 'name');

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete product (MANAGER and ADMIN only)
router.delete('/:id',
  restrictTo('ADMIN', 'MANAGER'),
  captureOriginalData(Product),
  auditMiddleware('DELETE', 'Product'),
  async (req, res, next) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
