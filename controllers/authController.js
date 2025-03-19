const sql = require("mssql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const dbConfig = require("../config/dbConfig");

const JWT_SECRET = process.env.JWT_SECRET; // Use environment variable

// User registration
async function register(req, res) {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let pool = await sql.connect(dbConfig);
    await pool.request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, hashedPassword)
      .query("INSERT INTO Users (username, password) VALUES (@username, @password)");

    res.json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// User login
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng điền tên đăng nhập và mật khẩu!" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: "Tên đăng nhập không tồn tại!" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Mật khẩu không chính xác!" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server: " + err.message });
  }
};

// Password reset
async function resetPassword(req, res) {
  const { email } = req.body;

  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE email = @email");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });

    // Send reset email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Use this token to reset your password: ${resetToken}`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  register,
  loginUser,
  resetPassword
};
