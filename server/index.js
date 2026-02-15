const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from parent directory if it exists (for local dev)
// In production (Render), these will come from env vars set in the dashboard
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✓ Loaded .env from parent directory');
} else {
  console.log('ℹ No .env file found - using environment variables from system/dashboard');
}

// Log startup
console.log(`
╔════════════════════════════════════════╗
║ Enterprise Inventory System - API Server
║ Environment: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════╝
`);

// Verify critical environment variables
if (!process.env.MONGODB_URI) {
  console.warn('⚠️  WARNING: MONGODB_URI not set - database operations will fail');
}
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set - authentication will fail');
}

let connectDB;
try {
  connectDB = require('./db');
} catch (err) {
  console.error('✗ Error loading database module:', err.message);
  process.exit(1);
}

const app = express();

// Middleware
// Simple CORS - allow all origins for now (debugging)
const corsOptions = {
  origin: '*',  // Allow all origins
  credentials: false,  // Can't use credentials with '*'
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400  // 24 hours
};

app.use(cors(corsOptions));

// Explicit CORS headers middleware for extra safety
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Expose-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(cookieParser());
app.use(express.json());

// Health check - always available
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Mount routes IMMEDIATELY (don't wait for DB connection)
console.log('Mounting API routes immediately...');
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✓ /api/auth mounted');
} catch (err) {
  console.error('✗ Error mounting /api/auth:', err && err.message ? err.message : err);
}
try {
  app.use('/api/session', require('./routes/auth'));
  console.log('✓ /api/session mounted');
} catch (err) {
  console.error('✗ Error mounting /api/session:', err && err.message ? err.message : err);
}
try {
  app.use('/api/users', require('./routes/users'));
  console.log('✓ /api/users mounted');
} catch (err) {
  console.error('✗ Error mounting /api/users:', err && err.message ? err.message : err);
}
try {
  app.use('/api/products', require('./routes/products'));
  console.log('✓ /api/products mounted');
} catch (err) {
  console.error('✗ Error mounting /api/products:', err && err.message ? err.message : err);
}
try {
  app.use('/api/categories', require('./routes/categories'));
  console.log('✓ /api/categories mounted');
} catch (err) {
  console.error('✗ Error mounting /api/categories:', err && err.message ? err.message : err);
}
try {
  app.use('/api/suppliers', require('./routes/suppliers'));
  console.log('✓ /api/suppliers mounted');
} catch (err) {
  console.error('✗ Error mounting /api/suppliers:', err && err.message ? err.message : err);
}
try {
  app.use('/api/audit-logs', require('./routes/audit'));
  console.log('✓ /api/audit-logs mounted');
} catch (err) {
  console.error('✗ Error mounting /api/audit-logs:', err && err.message ? err.message : err);
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

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Enterprise Inventory System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      session: '/api/session',
      users: '/api/users',
      products: '/api/products',
      categories: '/api/categories',
      suppliers: '/api/suppliers',
      auditLogs: '/api/audit-logs'
    }
  });
});

// 404 handler - must come after all other routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

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

// Start server - needed for all platforms (Render, traditional hosting)
// For Vercel serverless, this just won't run, but we export the app anyway
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║ ✅ Server running on port ${PORT}
║ 📍 Listening on 0.0.0.0
║ 🌍 Ready to accept requests
╚════════════════════════════════════════╝
  `);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Export for Vercel serverless deployment
module.exports = app;
