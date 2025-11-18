require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas Connection Successful!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    process.exit(1);
  }
};

testConnection();