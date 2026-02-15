const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const usersRoutes = require('../server/routes/users');

// Re-export the users routes
module.exports = router.use(usersRoutes);
