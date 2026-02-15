const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const productsRoutes = require('../server/routes/products');

// Re-export the products routes
module.exports = router.use(productsRoutes);
