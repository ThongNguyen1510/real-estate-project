require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase, sql } = require('./config/database');
const routes = require('./routes');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('./app');

// In ra các biến môi trường để debug
console.log('Environment Variables Check in index.js:');
console.log(`JWT_SECRET: ${typeof process.env.JWT_SECRET !== 'undefined' ? 'Defined' : 'Undefined'}`);
console.log(`PORT: ${process.env.PORT || 9000}`);

const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Request logging middleware
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

// Routes
const propertyRoutes = require("./routes/propertiesRoutes");
const imageRoutes = require("./routes/imageRoutes");

app.use('/api', propertyRoutes);
app.use('/api/images', imageRoutes);

// API đăng ký
app.post('/api/auth/register', async (req, res) => {
  const { username, name, email, password, phone } = req.body;
  if (!username || !name || !email || !password) {
    return res.status(400).send({ error: 'Missing required fields' });
  }
  try {
    const request = new sql.Request();
    const hashedPassword = await bcrypt.hash(password, 10);
    request.input('username', sql.NVarChar, username);
    request.input('name', sql.NVarChar, name);
    request.input('email', sql.NVarChar, email);
    request.input('password', sql.NVarChar, hashedPassword);
    request.input('phone', sql.NVarChar, phone);
    await request.query(`
      INSERT INTO Users (username, name, email, password, phone)
      VALUES (@username, @name, @email, @password, @phone)
    `);
    res.status(201).send({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send({ error: `Server error: ${err.message}` });
  }
});

// API đăng nhập
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send({ error: 'Missing required fields' });
  }
  try {
    const request = new sql.Request();
    request.input('username', sql.NVarChar, username);
    const result = await request.query(`
      SELECT * FROM Users WHERE username = @username
    `);
    const user = result.recordset[0];
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.status(200).send({ message: 'Login successful', token, user });
    } else {
      res.status(401).send({ error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).send({ error: `Server error: ${err.message}` });
  }
});

// Log registered routes
console.log('\n=== Registered Routes ===');
app._router.stack.forEach(function(middleware){
    if(middleware.route){ // routes registered directly on the app
        console.log(`${Object.keys(middleware.route.methods).join(',')} ${middleware.route.path}`);
    } else if(middleware.name === 'router'){ // router middleware 
        middleware.handle.stack.forEach(function(handler){
            if(handler.route){
                const methods = Object.keys(handler.route.methods);
                const path = handler.route.path;
                console.log(`${methods.join(',')} ${path}`);
            }
        });
    }
});
console.log('======================\n');

// Error handling
app.use((err, req, res, next) => {
  console.error('\n=== Error ===');
  console.error('Time:', new Date().toISOString());
  console.error('URL:', req.url);
  console.error('Error:', err.stack);
  console.error('======================\n');
  res.status(500).json({ 
    status: 'error',
    message: 'Something went wrong!'
  });
});

// Handle 404 - Route not found
app.use((req, res) => {
  console.log('\n=== 404 Not Found ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('======================\n');
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy route này'
  });
});

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
