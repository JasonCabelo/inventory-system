const express = require('express');
const Supplier = require('../models/Supplier');
const { protect, restrictTo } = require('../middlewares/auth');
const { supplierSchema, validate } = require('../validation/schemas');
const { auditMiddleware, captureOriginalData } = require('../middlewares/audit');
const router = express.Router();

// All routes are protected
router.use(protect);

// Get all suppliers (all roles)
router.get('/', async (req, res, next) => {
  try {
    const suppliers = await Supplier.find();
    
    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
});

// Get single supplier (all roles)
router.get('/:id', async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
});

// Create supplier (MANAGER and ADMIN only)
router.post('/',
  restrictTo('ADMIN', 'MANAGER'),
  validate(supplierSchema),
  auditMiddleware('CREATE', 'Supplier'),
  async (req, res, next) => {
    try {
      const supplier = await Supplier.create(req.body);

      res.status(201).json({
        success: true,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update supplier (MANAGER and ADMIN only)
router.put('/:id',
  restrictTo('ADMIN', 'MANAGER'),
  captureOriginalData(Supplier),
  auditMiddleware('UPDATE', 'Supplier'),
  async (req, res, next) => {
    try {
      const supplier = await Supplier.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }

      res.json({
        success: true,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete supplier (MANAGER and ADMIN only)
router.delete('/:id',
  restrictTo('ADMIN', 'MANAGER'),
  captureOriginalData(Supplier),
  auditMiddleware('DELETE', 'Supplier'),
  async (req, res, next) => {
    try {
      const supplier = await Supplier.findByIdAndDelete(req.params.id);
      
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }

      res.json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
