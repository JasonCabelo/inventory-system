const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const auditRoutes = require('../server/routes/audit');

// Re-export the audit routes
module.exports = router.use(auditRoutes);
