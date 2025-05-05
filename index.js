require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase, sql } = require('./config/database');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('./app'); // This already has all routes configured

// In ra các biến môi trường để debug
console.log('Environment Variables Check in index.js:');
console.log(`JWT_SECRET: ${typeof process.env.JWT_SECRET !== 'undefined' ? 'Defined' : 'Undefined'}`);
console.log(`PORT: ${process.env.PORT || 9000}`);

const PORT = process.env.PORT || 9000;

// Request logging middleware - add this since app.js doesn't have it
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('======================\n');
  next();
});

// Note: No need to add routes here, they're already in app.js

// Start server
const startServer = async () => {
  try {
    await connectToDatabase();
    console.log('✅ Kết nối cơ sở dữ liệu thành công!');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error);
    process.exit(1);
  }
};

startServer();
