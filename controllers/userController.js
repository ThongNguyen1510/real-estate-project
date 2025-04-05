const { sql } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const dbConfig = require("../config/dbConfig");

// Đăng ký người dùng
const registerUser = async (req, res) => {
    const { username, name, email, password, phone } = req.body;
    
    try {
        // Kiểm tra username đã tồn tại
        const checkUser = await sql.query`
            SELECT * FROM Users WHERE username = ${username} OR email = ${email}
        `;
        
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username hoặc email đã tồn tại'
            });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Thêm user mới
        const result = await sql.query`
            INSERT INTO Users (username, name, email, password, phone, role, status)
            VALUES (${username}, ${name}, ${email}, ${hashedPassword}, ${phone}, 'user', 'active')
            
            SELECT SCOPE_IDENTITY() AS id
        `;

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                id: result.recordset[0].id,
                username,
                name,
                email,
                phone
            }
        });
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Đăng nhập
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Tìm user theo username
        const result = await sql.query`
            SELECT * FROM Users WHERE username = ${username}
        `;

        const user = result.recordset[0];
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Username hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Username hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra trạng thái tài khoản
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị khóa'
            });
        }

        // Cập nhật last_login
        await sql.query`
            UPDATE Users 
            SET last_login = GETDATE()
            WHERE id = ${user.id}
        `;

        // Tạo token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
            token,
            user: {
                id: user.id,
                username: user.username,
                    name: user.name,
                email: user.email,
                    phone: user.phone,
                    role: user.role,
                    avatar_url: user.avatar_url
                }
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy thông tin người dùng
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await sql.query`
            SELECT id, username, name, email, phone, role, status, avatar_url, last_login, created_at
            FROM Users 
            WHERE id = ${userId}
        `;
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Lỗi lấy thông tin:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Cập nhật thông tin người dùng
const updateUserProfile = async (req, res) => {
    const { name, email, phone } = req.body;
    const userId = req.user.id;
    
    try {
        // Kiểm tra email đã tồn tại chưa
        const checkEmail = await sql.query`
            SELECT id FROM Users WHERE email = ${email} AND id != ${userId}
        `;
        
        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Cập nhật thông tin
        await sql.query`
            UPDATE Users 
            SET name = ${name},
                email = ${email},
                phone = ${phone},
                updated_at = GETDATE()
            WHERE id = ${userId}
        `;

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công'
        });
    } catch (error) {
        console.error('Lỗi cập nhật:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    try {
        // Lấy thông tin user
        const result = await sql.query`
            SELECT password FROM Users WHERE id = ${userId}
        `;
        
        const user = result.recordset[0];
        
        // Kiểm tra mật khẩu hiện tại
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Cập nhật mật khẩu
        await sql.query`
            UPDATE Users 
            SET password = ${hashedPassword},
                updated_at = GETDATE()
            WHERE id = ${userId}
        `;

        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Quên mật khẩu
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await sql.query`
            SELECT * FROM Users WHERE email = ${email}
        `;
        
        if (user.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Email không tồn tại' });
        }

        // Tạo token reset password
        const resetToken = jwt.sign(
            { id: user.recordset[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Lưu token vào database
        await sql.query`
            UPDATE Users 
            SET reset_token = ${resetToken},
                reset_token_expires = DATEADD(HOUR, 1, GETDATE())
            WHERE id = ${user.recordset[0].id}
        `;

        // Gửi email reset password
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Reset mật khẩu',
            html: `
                <h1>Reset mật khẩu</h1>
                <p>Click vào link sau để reset mật khẩu:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>Link sẽ hết hạn sau 1 giờ.</p>
            `
        });

        res.json({ success: true, message: 'Email reset mật khẩu đã được gửi' });
    } catch (error) {
        console.error('Lỗi khi gửi email reset mật khẩu:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Reset mật khẩu
const resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;
        
        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await sql.query`
            SELECT * FROM Users WHERE id = ${decoded.id}
        `;
        
        if (user.recordset.length === 0) {
            return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await sql.query`
            UPDATE Users 
            SET password = ${hashedPassword},
                reset_token = NULL,
                reset_token_expires = NULL
            WHERE id = ${decoded.id}
        `;
        
        res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Lỗi khi reset mật khẩu:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Xác thực email
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await sql.query`
            SELECT * FROM Users WHERE id = ${decoded.id}
        `;
        
        if (user.recordset.length === 0) {
            return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
        }

        await sql.query`
            UPDATE Users 
            SET email_verified = 1,
                email_verification_token = NULL
            WHERE id = ${decoded.id}
        `;

        res.json({ success: true, message: 'Xác thực email thành công' });
    } catch (error) {
        console.error('Lỗi khi xác thực email:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Gửi lại email xác thực
const resendVerification = async (req, res) => {
    try {
        const user = await sql.query`
            SELECT * FROM Users WHERE id = ${req.user.id}
        `;
        
        if (user.recordset[0].email_verified) {
            return res.status(400).json({ success: false, message: 'Email đã được xác thực' });
        }

        // Tạo token xác thực
        const token = jwt.sign(
            { id: user.recordset[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Gửi email xác thực
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: user.recordset[0].email,
            subject: 'Xác thực email',
            html: `
                <h1>Xác thực email</h1>
                <p>Click vào link sau để xác thực email:</p>
                <a href="${verifyUrl}">${verifyUrl}</a>
                <p>Link sẽ hết hạn sau 24 giờ.</p>
            `
        });

        res.json({ success: true, message: 'Email xác thực đã được gửi lại' });
    } catch (error) {
        console.error('Lỗi khi gửi lại email xác thực:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Đăng xuất
const logout = async (req, res) => {
    try {
        // Có thể thêm logic blacklist token ở đây
        res.json({ success: true, message: 'Đăng xuất thành công' });
    } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Lấy danh sách bất động sản của người dùng
const getUserProperties = async (req, res) => {
    try {
        const properties = await sql.query`
            SELECT p.*, 
                   (SELECT TOP 1 url FROM PropertyImages WHERE property_id = p.id) as thumbnail
            FROM Properties p
            WHERE p.user_id = ${req.user.id}
            ORDER BY p.created_at DESC
        `;

        res.json({
            success: true,
            data: properties.recordset
        });
    } catch (error) {
        console.error('Lỗi get user properties:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy danh sách yêu thích của người dùng
const getUserFavorites = async (req, res) => {
    try {
        const favorites = await sql.query`
            SELECT p.*, 
                   (SELECT TOP 1 url FROM PropertyImages WHERE property_id = p.id) as thumbnail
            FROM Properties p
            INNER JOIN UserFavorites f ON p.id = f.property_id
            WHERE f.user_id = ${req.user.id}
            ORDER BY f.created_at DESC
        `;

        res.json({
            success: true,
            data: favorites.recordset
        });
    } catch (error) {
        console.error('Lỗi get user favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy cài đặt người dùng
const getUserSettings = async (req, res) => {
    try {
        const settings = await sql.query`
            SELECT notification_email, notification_sms, language
            FROM UserSettings
            WHERE user_id = ${req.user.id}
        `;

        res.json({
            success: true,
            data: settings.recordset[0] || {
                notification_email: true,
                notification_sms: true,
                language: 'vi'
            }
        });
    } catch (error) {
        console.error('Lỗi get user settings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Cập nhật cài đặt người dùng
const updateUserSettings = async (req, res) => {
    const { notification_email, notification_sms, language } = req.body;
    
    try {
        await sql.query`
            MERGE INTO UserSettings WITH (HOLDLOCK) AS target
            USING (VALUES (${req.user.id}, ${notification_email}, ${notification_sms}, ${language})) 
                AS source (user_id, notification_email, notification_sms, language)
            ON target.user_id = source.user_id
            WHEN MATCHED THEN
                UPDATE SET 
                    notification_email = source.notification_email,
                    notification_sms = source.notification_sms,
                    language = source.language
            WHEN NOT MATCHED THEN
                INSERT (user_id, notification_email, notification_sms, language)
                VALUES (source.user_id, source.notification_email, source.notification_sms, source.language);
        `;

        res.json({
            success: true,
            message: 'Cập nhật cài đặt thành công'
        });
    } catch (error) {
        console.error('Lỗi update user settings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy thông báo của người dùng
const getUserNotifications = async (req, res) => {
    try {
        const notifications = await sql.query`
            SELECT *
            FROM UserNotifications
            WHERE user_id = ${req.user.id}
            ORDER BY created_at DESC
        `;

        res.json({
            success: true,
            data: notifications.recordset
        });
    } catch (error) {
        console.error('Lỗi get user notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Đánh dấu thông báo đã đọc
const markNotificationsAsRead = async (req, res) => {
    try {
        await sql.query`
            UPDATE UserNotifications
            SET is_read = 1
            WHERE user_id = ${req.user.id}
            AND is_read = 0
        `;

        res.json({
            success: true,
            message: 'Đã đánh dấu tất cả thông báo là đã đọc'
        });
    } catch (error) {
        console.error('Lỗi mark notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Xóa thông báo
const deleteNotification = async (req, res) => {
    const { id } = req.params;
    
    try {
        await sql.query`
            DELETE FROM UserNotifications
            WHERE id = ${id}
            AND user_id = ${req.user.id}
        `;

        res.json({
            success: true,
            message: 'Đã xóa thông báo'
        });
    } catch (error) {
        console.error('Lỗi delete notification:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Lấy cài đặt thông báo
const getNotificationSettings = async (req, res) => {
    try {
        const settings = await sql.query`
            SELECT notification_email, notification_sms, language
            FROM UserSettings
            WHERE user_id = ${req.user.id}
        `;

        res.json({ success: true, data: settings.recordset[0] || {
            notification_email: true,
            notification_sms: true,
            language: 'vi'
        } });
    } catch (error) {
        console.error('Lỗi khi lấy cài đặt thông báo:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Cập nhật cài đặt thông báo
const updateNotificationSettings = async (req, res) => {
    try {
        const { notification_email, notification_sms, language } = req.body;
        await sql.query`
            MERGE INTO UserSettings WITH (HOLDLOCK) AS target
            USING (VALUES (${req.user.id}, ${notification_email}, ${notification_sms}, ${language})) 
                AS source (user_id, notification_email, notification_sms, language)
            ON target.user_id = source.user_id
            WHEN MATCHED THEN
                UPDATE SET 
                    notification_email = source.notification_email,
                    notification_sms = source.notification_sms,
                    language = source.language
            WHEN NOT MATCHED THEN
                INSERT (user_id, notification_email, notification_sms, language)
                VALUES (source.user_id, source.notification_email, source.notification_sms, source.language);
        `;

        res.json({ success: true, message: 'Cập nhật cài đặt thông báo thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật cài đặt thông báo:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Xóa tài khoản
const deleteAccount = async (req, res) => {
    try {
        await sql.query`
            DELETE FROM Users
            WHERE id = ${req.user.id}
        `;

        res.json({ success: true, message: 'Xóa tài khoản thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa tài khoản:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    logout,
    getUserProperties,
    getUserFavorites,
    getUserSettings,
    updateUserSettings,
    getUserNotifications,
    markNotificationsAsRead,
    deleteNotification,
    getNotificationSettings,
    updateNotificationSettings,
    deleteAccount
};
