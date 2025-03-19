require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase, sql } = require('./config/database');
const routes = require('./routes');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Tải các biến môi trường từ tệp .env

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Cấu hình kết nối cơ sở dữ liệu
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: 'RealEstateDB',
    options: {
        encrypt: true, // Sử dụng mã hóa
        trustServerCertificate: true // Bỏ qua kiểm tra chứng chỉ tự ký
    }
};

// Kết nối cơ sở dữ liệu
sql.connect(dbConfig, err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to database');
    }
});

// Routes
app.use('/api', routes);

// API đăng ký
app.post('/api/auth/register', async (req, res) => {
  const { username, name, email, password, phone } = req.body;
  if (!username || !name || !email || !password) {
    return res.status(400).send({ error: 'Missing required fields' });
  }
  try {
    const request = new sql.Request();
    const hashedPassword = await bcrypt.hash(password, 10); // Mã hóa mật khẩu
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: 'Something went wrong!'
  });
});

// Start server
const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

startServer();
