const { z } = require('zod');

// User validation schemas
const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MANAGER', 'VIEWER']).optional()
});

const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const mfaVerifySchema = z.object({
  tempToken: z.string(),
  mfaCode: z.string().length(6)
});

const mfaSetupSchema = z.object({
  mfaCode: z.string().length(6)
});

// Product validation schemas
const productSchema = z.object({
  name: z.string().min(2).max(100),
  SKU: z.string().min(1).max(50),
  category: z.string(), // MongoDB ObjectId as string
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  quantity: z.number().min(0).default(0),
  minStockLevel: z.number().min(0).default(10),
  supplier: z.string().optional() // MongoDB ObjectId as string
});

// Category validation schemas
const categorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional()
});

// Supplier validation schemas
const supplierSchema = z.object({
  name: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(20).optional(),
  address: z.string().max(300).optional()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = {
  userSchema,
  userLoginSchema,
  mfaVerifySchema,
  mfaSetupSchema,
  productSchema,
  categorySchema,
  supplierSchema,
  validate
};
