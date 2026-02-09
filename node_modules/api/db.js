const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI environment variable not set. Database features will be unavailable.');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed admin user if it doesn't exist
    await seedAdminIfNeeded();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Don't exit in production/serverless
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

const seedAdminIfNeeded = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@inventory.com',
      passwordHash: 'Admin123!',
      role: 'ADMIN',
      mfaEnabled: false
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@inventory.com');
    console.log('🔑 Password: Admin123!');
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

module.exports = connectDB;
