const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const suppliersRoutes = require('../server/routes/suppliers');

// Re-export the suppliers routes
module.exports = router.use(suppliersRoutes);
