const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../server/db');

const app = express();

// Middleware
const rawFrontend = process.env.FRONTEND_URL || '';
const frontendUrl = typeof rawFrontend === 'string' ? rawFrontend.trim().replace(/\s+/g, '') : '';
const corsOrigin = frontendUrl || 'http://localhost:5173';

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost')) return callback(null, true);
    if (origin.includes('vercel.app')) return callback(null, true);
    if (origin.includes('render.com')) return callback(null, true);
    if (frontendUrl && origin === frontendUrl) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Mount routes
app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/session', require('../server/routes/auth'));
app.use('/api/users', require('../server/routes/users'));
app.use('/api/products', require('../server/routes/products'));
app.use('/api/categories', require('../server/routes/categories'));
app.use('/api/suppliers', require('../server/routes/suppliers'));
app.use('/api/audit-logs', require('../server/routes/audit'));

// Connect to database
const hasDB = !!process.env.MONGODB_URI;
if (hasDB) {
  connectDB().catch((err) => {
    console.error('Database connection error:', err.message);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

module.exports = app;
