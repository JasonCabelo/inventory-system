const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');


// Load environment variables
dotenv.config();

const connectDB = require('./db');

const app = express();

// Middleware
// Sanitize FRONTEND_URL to avoid invalid header characters
const rawFrontend = process.env.FRONTEND_URL || '';
const frontendUrl = typeof rawFrontend === 'string' ? rawFrontend.trim().replace(/\s+/g, '') : '';
const corsOrigin = frontendUrl || 'http://localhost:5173';
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Health check - always available
app.get('/server/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Serve static frontend files if present
// NOTE: static frontend serving and SPA fallback are registered AFTER
// API routes are mounted below. This prevents the SPA catch-all from
// intercepting `/server/*` requests and returning 404 when the frontend
// `dist` folder exists.

// Mount routes IMMEDIATELY (don't wait for DB connection)
console.log('Mounting API routes immediately...');
try {
  app.use('/server/auth', require('./routes/auth'));
  console.log('✓ /server/auth mounted');
} catch (err) {
  console.error('✗ Error mounting /server/auth:', err && err.message ? err.message : err);
}
try {
  app.use('/server/session', require('./routes/auth'));
  console.log('✓ /server/session mounted');
} catch (err) {
  console.error('✗ Error mounting /server/session:', err && err.message ? err.message : err);
}
try {
  app.use('/server/users', require('./routes/users'));
  console.log('✓ /server/users mounted');
} catch (err) {
  console.error('✗ Error mounting /server/users:', err && err.message ? err.message : err);
}
try {
  app.use('/server/products', require('./routes/products'));
  console.log('✓ /server/products mounted');
} catch (err) {
  console.error('✗ Error mounting /server/products:', err && err.message ? err.message : err);
}
try {
  app.use('/server/categories', require('./routes/categories'));
  console.log('✓ /server/categories mounted');
} catch (err) {
  console.error('✗ Error mounting /server/categories:', err && err.message ? err.message : err);
}
try {
  app.use('/server/suppliers', require('./routes/suppliers'));
  console.log('✓ /server/suppliers mounted');
} catch (err) {
  console.error('✗ Error mounting /server/suppliers:', err && err.message ? err.message : err);
}
try {
  app.use('/server/audit-logs', require('./routes/audit'));
  console.log('✓ /server/audit-logs mounted');
} catch (err) {
  console.error('✗ Error mounting /server/audit-logs:', err && err.message ? err.message : err);
}

// Connect to DB asynchronously (don't block route mounting)
const hasDB = !!process.env.MONGODB_URI;
if (hasDB) {
  connectDB()
    .then(() => {
      console.log('✓ Database connected in background');
    })
    .catch((err) => {
      console.error('✗ Database connection failed in background:', err && err.message ? err.message : err);
    });
}



// Serve static frontend files if present (after API routes are mounted)
const staticPath = path.join(__dirname, '../dist');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/server')) return next();
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
    return res.status(404).send('Frontend not found');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ message: 'Internal server error' });
});

// Top-level handlers
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Start local dev server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
