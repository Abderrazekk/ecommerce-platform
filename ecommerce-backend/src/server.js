require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User.model');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Create default admin if none exists
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const defaultAdmin = await User.create({
        name: process.env.DEFAULT_ADMIN_NAME || 'Admin',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        phone: '+1234567890',
        address: 'Default Admin Address',
      });
      
      console.log('Default admin created successfully:', defaultAdmin.email);
    } else {
      console.log('Admin account already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    await createDefaultAdmin();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});

startServer();