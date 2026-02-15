const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const authRoutes = require('../server/routes/auth');

// Re-export the auth routes
module.exports = router.use(authRoutes);
