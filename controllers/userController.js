const sql = require("mssql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dbConfig = require("../config/dbConfig");

// Đăng ký user
const registerUser = async (req, res) => {
    const { username, name, email, password, phone } = req.body;

    if (!username || !name || !email || !password) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
    }

    try {
        const pool = await sql.connect(dbConfig);

        // Kiểm tra email đã tồn tại
        const checkEmail = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({ message: "Email đã được sử dụng!" });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Thêm user mới
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .input('phone', sql.NVarChar, phone)
            .query('INSERT INTO Users (username, name, email, password, phone) VALUES (@username, @name, @email, @password, @phone)');

        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi server: " + err.message });
    }
};

// Đăng nhập user
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

        // Tạo JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
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

// Quên mật khẩu
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Vui lòng nhập email!" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Email không tồn tại!" });
        }

        // Tạo reset token
        const resetToken = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Cấu hình nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Gửi email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Đặt lại mật khẩu',
            html: `
                <h2>Yêu cầu đặt lại mật khẩu</h2>
                <p>Click vào link sau để đặt lại mật khẩu của bạn:</p>
                <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">
                    Đặt lại mật khẩu
                </a>
                <p>Link này sẽ hết hạn sau 15 phút.</p>
            `
        });

        res.json({ message: "Email đặt lại mật khẩu đã được gửi!" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi server: " + err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword
};
