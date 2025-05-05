const jwt = require('jsonwebtoken');
const { sql, connectToDatabase } = require('../config/database');
require('dotenv').config();

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

// Middleware kiểm tra quyền admin
const isAdmin = async (req, res, next) => {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query('SELECT role FROM Users WHERE id = @userId');

    if (result.recordset.length === 0 || result.recordset[0].role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    next();
  } catch (error) {
    console.error('isAdmin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = { auth, isAdmin };
