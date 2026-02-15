const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const categoriesRoutes = require('../server/routes/categories');

// Re-export the categories routes
module.exports = router.use(categoriesRoutes);
