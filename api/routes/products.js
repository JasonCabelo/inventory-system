const express = require('express');
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middlewares/auth');
const { productSchema, validate } = require('../validation/schemas');
const { auditMiddleware, captureOriginalData } = require('../middlewares/audit');
const router = express.Router();

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
