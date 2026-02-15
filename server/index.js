// ============================================================================
// IMMEDIATE STARTUP OUTPUT (before any requires that might fail)
// ============================================================================
console.log('\n╔════════════════════════════════════════╗');
console.log('║ Enterprise Inventory System - API      ║');
console.log('║ Starting server...                     ║');
console.log('╚════════════════════════════════════════╝\n');

process.stdout.write('Loading dependencies...');

try {
  const express = require('express');
  const cors = require('cors');
  const cookieParser = require('cookie-parser');
  const dotenv = require('dotenv');
  const path = require('path');
  const fs = require('fs');

  process.stdout.write(' ✓\n');

  // Load environment variables from parent directory if it exists (for local dev)
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('✓ Loaded .env from parent directory');
  } else {
    console.log('ℹ No .env file - using dashboard/system env vars');
  }

  // Verify critical environment variables
  console.log('\nEnvironment Check:');
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  - MONGODB_URI: ${process.env.MONGODB_URI ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Missing'}`);
  console.log(`  - FRONTEND_URL: ${process.env.FRONTEND_URL || '(not set)'}`);
  console.log(`  - PORT: ${process.env.PORT || 3001}`);

  process.stdout.write('\nLoading database module... ');
  let connectDB;
  try {
    connectDB = require('./db');
    process.stdout.write('✓\n');
  } catch (err) {
    process.stdout.write(`✗\n  Error: ${err.message}\n`);
    connectDB = null;
  }

  process.stdout.write('Creating Express app... ');
  const app = express();
  process.stdout.write('✓\n');

  // Middleware
  // CORS configuration
  // If FRONTEND_URL is set, allow credentialed requests from that origin.
  const FRONTEND_URL = process.env.FRONTEND_URL || '';
  const allowCredentials = !!FRONTEND_URL;

  const corsOptions = {
    origin: FRONTEND_URL || '*',
    credentials: allowCredentials,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
  };

  app.use(cors(corsOptions));

  // Explicit CORS headers middleware for extra safety
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    // If credentials are allowed, Access-Control-Allow-Origin must be explicit (not '*')
    if (allowCredentials) {
      // Only echo the configured FRONTEND_URL to avoid reflecting arbitrary origins
      res.header('Access-Control-Allow-Origin', FRONTEND_URL);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }

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
  console.log('\nMounting API routes...');
  try {
    app.use('/api/auth', require('./routes/auth'));
    console.log('  ✓ /api/auth');
  } catch (err) {
    console.log(`  ✗ /api/auth: ${err.message}`);
  }
  try {
    app.use('/api/session', require('./routes/auth'));
    console.log('  ✓ /api/session');
  } catch (err) {
    console.log(`  ✗ /api/session: ${err.message}`);
  }
  try {
    app.use('/api/users', require('./routes/users'));
    console.log('  ✓ /api/users');
  } catch (err) {
    console.log(`  ✗ /api/users: ${err.message}`);
  }
  try {
    app.use('/api/products', require('./routes/products'));
    console.log('  ✓ /api/products');
  } catch (err) {
    console.log(`  ✗ /api/products: ${err.message}`);
  }
  try {
    app.use('/api/categories', require('./routes/categories'));
    console.log('  ✓ /api/categories');
  } catch (err) {
    console.log(`  ✗ /api/categories: ${err.message}`);
  }
  try {
    app.use('/api/suppliers', require('./routes/suppliers'));
    console.log('  ✓ /api/suppliers');
  } catch (err) {
    console.log(`  ✗ /api/suppliers: ${err.message}`);
  }
  try {
    app.use('/api/audit-logs', require('./routes/audit'));
    console.log('  ✓ /api/audit-logs');
  } catch (err) {
    console.log(`  ✗ /api/audit-logs: ${err.message}`);
  }

  // Connect to DB asynchronously (don't block route mounting)
  if (connectDB && process.env.MONGODB_URI) {
    console.log('\nConnecting to database...');
    connectDB()
      .then(() => {
        console.log('✓ Database connected');
      })
      .catch((err) => {
        console.error('✗ Database connection failed:', err.message);
      });
  } else {
    console.log('\n⚠️  Skipping database connection (missing MONGODB_URI or connectDB module)');
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

  // Handle process errors
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  // Start server
  const PORT = process.env.PORT || 3001;

  console.log(`\nStarting HTTP server on port ${PORT}...`);

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════╗
║ ✅ SERVER STARTED SUCCESSFULLY
║ 
║ Port: ${PORT}
║ Host: 0.0.0.0
║ Ready for requests
║
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

} catch (err) {
  console.error('\n❌ FATAL ERROR DURING STARTUP:');
  console.error(err);
  process.exit(1);
}
