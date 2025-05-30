const { sql } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const dbConfig = require("../config/dbConfig");

// Đăng ký người dùng
const registerUser = async (req, res) => {
    const { username, name, email, password, phone } = req.body;
    
    try {
        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ. Vui lòng nhập đúng định dạng email.'
            });
        }

        // Email validation for domain and length
        if (email.length > 255) {
            return res.status(400).json({
                success: false,
                message: 'Email không được vượt quá 255 ký tự'
            });
        }

        if (email.indexOf('@') <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Email phải có tên người dùng trước @'
            });
        }

        if (email.indexOf('.') <= email.indexOf('@') + 1) {
            return res.status(400).json({
                success: false,
                message: 'Email phải có tên domain hợp lệ sau @'
            });
        }
        
        // Kiểm tra username, email hoặc phone đã tồn tại
        const checkUser = await sql.query`
            SELECT * FROM Users 
            WHERE username = ${username} 
            OR email = ${email} 
            OR phone = ${phone}
        `;
        
        if (checkUser.recordset.length > 0) {
            // Kiểm tra cụ thể xem trùng field nào
            const existingUser = checkUser.recordset[0];
            if (existingUser.username === username) {
                return res.status(400).json({
                    success: false,
                    message: 'Username đã tồn tại'
                });
            }
            if (existingUser.email === email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã tồn tại'
                });
            }
            if (existingUser.phone === phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại đã tồn tại'
                });
            }
            
            return res.status(400).json({
                success: false,
                message: 'Thông tin đăng ký đã tồn tại'
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

        const userId = result.recordset[0].id;
        
        // Cập nhật last_login
        await sql.query`
            UPDATE Users 
            SET last_login = GETDATE()
            WHERE id = ${userId}
        `;

        // Tạo token JWT
        const JWT_SECRET = process.env.JWT_SECRET || 'Thong15102004';
        const token = jwt.sign(
            { 
                id: userId, 
                username: username,
                role: 'user' 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                token,
                user: {
                    id: userId,
                username,
                name,
                email,
                    phone,
                    role: 'user'
                }
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
    // Chấp nhận cả username và identifier để tương thích với frontend cũ và mới
    const { username, identifier, password } = req.body;
    
    // Xác định giá trị đăng nhập (username hoặc identifier)
    const loginValue = identifier || username;
    
    if (!loginValue || !password) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng cung cấp thông tin đăng nhập và mật khẩu'
        });
    }
    
    try {
        // Tìm user theo username, email hoặc phone
        const result = await sql.query`
            SELECT * FROM Users WHERE username = ${loginValue} OR email = ${loginValue} OR phone = ${loginValue}
        `;

        const user = result.recordset[0];
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'SĐT/Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'SĐT/Email hoặc mật khẩu không đúng'
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
        const JWT_SECRET = process.env.JWT_SECRET || 'Thong15102004';
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                role: user.role 
            },
            JWT_SECRET,
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
    try {
        const { current_password, new_password } = req.body;
        
        // Kiểm tra các trường bắt buộc
        if (!current_password || !new_password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới' 
            });
        }

        // Lấy thông tin user
        const result = await sql.query`
            SELECT id, password 
            FROM Users 
            WHERE id = ${req.user.id}
        `;

        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Người dùng không tồn tại' 
            });
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mật khẩu hiện tại không đúng' 
            });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        // Cập nhật mật khẩu (bỏ updated_at)
        await sql.query`
            UPDATE Users 
            SET password = ${hashedPassword}
            WHERE id = ${req.user.id}
        `;
        
        res.json({ 
            success: true, 
            message: 'Đổi mật khẩu thành công' 
        });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server' 
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
            process.env.JWT_SECRET || 'Thong15102004',
            { expiresIn: '1h' }
        );

        // Lưu token vào database
        await sql.query`
            UPDATE Users 
            SET reset_token = ${resetToken},
                reset_token_expires = DATEADD(HOUR, 1, GETDATE())
            WHERE id = ${user.recordset[0].id}
        `;

        // Log token để dễ dàng debug nếu cần
        console.log('============== RESET PASSWORD TOKEN ==============');
        console.log(resetToken);
        console.log('==================================================');

        // Gửi email reset password
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: process.env.SMTP_SECURE === 'true' || true,
            auth: {
                user: process.env.SMTP_USER || 'your_email@gmail.com', // Thay bằng email thật
                pass: process.env.SMTP_PASS || 'your_app_password'  // Thay bằng app password
            }
        });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dat-lai-mat-khau?token=${resetToken}`;
        
        try {
        await transporter.sendMail({
                from: process.env.SMTP_FROM || 'your_email@gmail.com', // Thay bằng email thật
            to: email,
            subject: 'Reset mật khẩu',
            html: `
                <h1>Reset mật khẩu</h1>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
                <p>Click vào link sau để reset mật khẩu:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>Link sẽ hết hạn sau 1 giờ.</p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            `
        });

        res.json({ success: true, message: 'Email reset mật khẩu đã được gửi' });
        } catch (emailError) {
            console.error('Lỗi gửi email:', emailError);
            
            // Vẫn trả về thành công và hiển thị token trong console
            res.json({ 
                success: true, 
                message: 'Không thể gửi email, nhưng token đã được tạo. Kiểm tra logs.',
                debug: process.env.NODE_ENV === 'development' ? resetToken : undefined
            });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý yêu cầu reset mật khẩu:', error);
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
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;
        const offset = (page - 1) * limit;
        
        // Tạo request
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);
        
        // Query lấy danh sách bất động sản với phân trang
        const query = `
            SELECT 
                p.id, p.title, p.price, p.area, p.property_type, p.status, 
                p.created_at, p.primary_image_url, p.images, p.expires_at,
                l.address, l.district, l.city
            FROM 
                Properties p
            LEFT JOIN 
                Locations l ON p.location_id = l.id
            WHERE 
                p.owner_id = @userId
            ORDER BY 
                p.created_at DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;
        
        const result = await request.query(query);
        
        // Query đếm tổng số bất động sản
        const countQuery = `
            SELECT COUNT(*) as total FROM Properties WHERE owner_id = @userId
        `;
        
        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0].total;
        
        // Định dạng kết quả
        const properties = result.recordset.map(property => {
            // Map status to listing_type for backward compatibility with frontend
            let listing_type = 'sale';
            if (property.status === 'for_rent') {
                listing_type = 'rent';
            } else if (property.status === 'for_sale') {
                listing_type = 'sale';
            }
            
            // Xử lý hình ảnh
            let imageUrls = [];
            
            // Thử parse JSON images nếu có
            if (property.images) {
                try {
                    imageUrls = JSON.parse(property.images);
                } catch (error) {
                    console.error('Lỗi khi parse JSON images:', error);
                }
            }
            
            // Nếu không có ảnh từ trường images, sử dụng primary_image_url
            if (!imageUrls || imageUrls.length === 0) {
                if (property.primary_image_url) {
                    imageUrls = [property.primary_image_url];
                } else {
                    // Ảnh mặc định nếu không có ảnh nào
                    imageUrls = ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop'];
                }
            }
            
            return {
                id: property.id,
                title: property.title,
                price: property.price,
                area: property.area,
                property_type: property.property_type,
                property_type_display: getPropertyTypeDisplay(property.property_type),
                listing_type: listing_type, // Add derived listing_type for frontend compatibility
                status: property.status,
                status_display: getStatusDisplay(property.status),
                address: property.address,
                district: property.district,
                city: property.city,
                created_at: property.created_at,
                expires_at: property.expires_at,
                images: imageUrls,
                image_url: property.primary_image_url || (imageUrls.length > 0 ? imageUrls[0] : null)
            };
        });
        
        res.json({
            success: true,
            message: 'Lấy danh sách bất động sản thành công',
            data: {
                properties,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bất động sản:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Hàm hiển thị loại bất động sản
const getPropertyTypeDisplay = (type) => {
    const typeMap = {
        'house': 'Nhà riêng',
        'villa': 'Biệt thự',
        'apartment': 'Căn hộ chung cư',
        'land': 'Đất nền',
        'commercial': 'Mặt bằng kinh doanh',
        'office': 'Văn phòng',
        'shop': 'Mặt bằng kinh doanh'
    };
    return typeMap[type] || type;
};

// Hàm hiển thị trạng thái
const getStatusDisplay = (status) => {
    const statusMap = {
        'available': 'Đang hiển thị',
        'pending': 'Chờ duyệt',
        'sold': 'Đã bán',
        'rented': 'Đã cho thuê',
        'expired': 'Hết hạn',
        'maintenance': 'Bảo trì',
        'for_rent': 'Cho thuê',
        'for_sale': 'Đang bán'
    };
    return statusMap[status] || status;
};

// Lấy danh sách bất động sản yêu thích
const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Tạo một request object
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        
        // Query lấy đầy đủ thông tin
        const query = `
            SELECT 
                p.id, p.title, p.price, p.area, p.property_type, p.status, 
                p.bedrooms, p.bathrooms, p.primary_image_url, p.images,
                l.address, l.city, l.district, l.ward, l.street,
                f.id as favorite_id, f.created_at as added_date,
                u.name as owner_name, u.phone as owner_phone
            FROM 
                Favorites f
            JOIN 
                Properties p ON f.property_id = p.id
            LEFT JOIN 
                Locations l ON p.location_id = l.id
            LEFT JOIN 
                Users u ON p.owner_id = u.id
            WHERE 
                f.user_id = @userId
            ORDER BY 
                f.created_at DESC
        `;
        
        const result = await request.query(query);
        
        // Xử lý kết quả
        const favorites = result.recordset.map(property => {
            // Xử lý trường listing_type
            let listing_type = 'sale';
            if (property.status === 'for_rent') {
                listing_type = 'rent';
            } else if (property.status === 'for_sale') {
                listing_type = 'sale';
            }
            
            // Xử lý hình ảnh
            let imageUrls = [];
            
            // Thử parse JSON images nếu có
            if (property.images) {
                try {
                    imageUrls = JSON.parse(property.images);
                } catch (error) {
                    console.error('Lỗi khi parse JSON images:', error);
                }
            }
            
            // Nếu không có ảnh từ trường images, sử dụng primary_image_url
            if (!imageUrls || imageUrls.length === 0) {
                if (property.primary_image_url) {
                    imageUrls = [property.primary_image_url];
                } else {
                    // Ảnh mặc định nếu không có ảnh nào
                    imageUrls = ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop'];
                }
            }
            
            // Format và trả về dữ liệu đầy đủ
            return {
                ...property,
                listing_type: listing_type,
                image_url: property.primary_image_url || (imageUrls.length > 0 ? imageUrls[0] : null),
                images: imageUrls,
                full_address: `${property.address || ''}, ${property.district || ''}, ${property.city || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
            };
        });
        
        res.json({
            success: true,
            data: favorites
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
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
    // Chuyển tiếp tới notificationController
    const notificationController = require('./notificationController');
    return notificationController.getUserNotifications(req, res);
};

// Đánh dấu thông báo đã đọc
const markNotificationsAsRead = async (req, res) => {
    // Chuyển tiếp tới notificationController
    const notificationController = require('./notificationController');
    return notificationController.markAllAsRead(req, res);
};

// Xóa thông báo
const deleteNotification = async (req, res) => {
    // Chuyển tiếp tới notificationController
    const notificationController = require('./notificationController');
    return notificationController.deleteNotification(req, res);
};

// Lấy cài đặt thông báo
const getNotificationSettings = async (req, res) => {
    // Chuyển tiếp tới notificationController
    const notificationController = require('./notificationController');
    return notificationController.getNotificationSettings(req, res);
};

// Cập nhật cài đặt thông báo
const updateNotificationSettings = async (req, res) => {
    // Chuyển tiếp tới notificationController
    const notificationController = require('./notificationController');
    return notificationController.updateNotificationSettings(req, res);
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

// Thêm vào danh sách yêu thích
const addToFavorites = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const userId = req.user.id;

        // Kiểm tra xem đã thêm vào yêu thích chưa
        const existing = await sql.query`
            SELECT id FROM Favorites 
            WHERE user_id = ${userId} AND property_id = ${propertyId}
        `;

        if (existing.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bất động sản này đã có trong danh sách yêu thích'
            });
        }

        // Thêm vào yêu thích
        await sql.query`
            INSERT INTO Favorites (user_id, property_id, created_at)
            VALUES (${userId}, ${propertyId}, GETDATE())
        `;

        res.json({
            success: true,
            message: 'Đã thêm vào danh sách yêu thích'
        });
    } catch (error) {
        console.error('Lỗi add to favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Xóa khỏi danh sách yêu thích
const removeFromFavorites = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const userId = req.user.id;

        const result = await sql.query`
            DELETE FROM Favorites
            WHERE user_id = ${userId} AND property_id = ${propertyId}
        `;

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bất động sản này trong danh sách yêu thích'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa khỏi danh sách yêu thích'
        });
    } catch (error) {
        console.error('Lỗi remove from favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Cập nhật avatar người dùng
const updateAvatar = async (req, res) => {
    try {
        // Kiểm tra thông tin người dùng
        console.log('User ID:', req.user ? req.user.id : 'undefined');
        console.log('Request file:', req.file);
        console.log('Request headers:', req.headers);

        // Khi đến đây, file ảnh đã được upload bởi middleware multer
        // và lưu trong req.file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file ảnh được tải lên'
            });
        }

        // Đường dẫn file đã tải lên
        const baseUrl = process.env.BASE_URL || 'http://localhost:9000';
        const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
        console.log('Avatar URL:', avatarUrl);

        try {
            // Cập nhật avatar_url trong database sử dụng tham số thông thường
            // thay vì template literal
            console.log('Updating database...');
            const updateQuery = 'UPDATE Users SET avatar_url = @avatarUrl WHERE id = @userId';
            const updateRequest = new sql.Request();
            updateRequest.input('avatarUrl', sql.NVarChar, avatarUrl);
            updateRequest.input('userId', sql.Int, req.user.id);
            await updateRequest.query(updateQuery);
            
            console.log('Database updated successfully');

            // Lấy thông tin người dùng sau khi cập nhật sử dụng tham số thông thường
            console.log('Fetching updated user data...');
            const selectQuery = 'SELECT id, username, name, email, phone, role, status, avatar_url as avatar FROM Users WHERE id = @userId';
            const selectRequest = new sql.Request();
            selectRequest.input('userId', sql.Int, req.user.id);
            const userResult = await selectRequest.query(selectQuery);
            
            console.log('User data fetched:', userResult.recordset[0]);

            if (userResult.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            // Trả về kết quả phù hợp với cấu trúc mà frontend mong đợi
            // Thêm header để cho phép CORS
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            // Trả về kết quả với thông tin đầy đủ
            const responseData = {
                success: true,
                message: 'Cập nhật avatar thành công',
                data: {
                    avatar: avatarUrl,
                    user: userResult.recordset[0]
                }
            };
            
            console.log('Response data:', responseData);
            res.status(200).json(responseData);
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({
                success: false,
                message: 'Lỗi cơ sở dữ liệu',
                error: dbError.message
            });
        }
    } catch (error) {
        console.error('Lỗi cập nhật avatar:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy thông tin người dùng theo ID
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log('Fetching user info for ID:', userId);
        
        const result = await sql.query`
            SELECT id, username, name as full_name, email, phone, role, status, avatar_url, last_login, created_at
            FROM Users 
            WHERE id = ${userId}
        `;
        
        if (result.recordset.length === 0) {
            console.log('User not found for ID:', userId);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        console.log('User data found:', result.recordset[0]);
        res.status(200).json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Lỗi lấy thông tin người dùng theo ID:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Đếm số lượng tin đăng của người dùng
const getUserPropertyCount = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await sql.query`
            SELECT COUNT(*) as count
            FROM Properties
            WHERE user_id = ${userId}
        `;
        
        res.status(200).json({
            success: true,
            data: {
                count: result.recordset[0].count
            }
        });
    } catch (error) {
        console.error('Lỗi đếm tin đăng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Đếm số lượng tin yêu thích của người dùng
const getUserFavoriteCount = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await sql.query`
            SELECT COUNT(*) as count
            FROM Favorites
            WHERE user_id = ${userId}
        `;
        
        res.status(200).json({
            success: true,
            data: {
                count: result.recordset[0].count
            }
        });
    } catch (error) {
        console.error('Lỗi đếm tin yêu thích:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Get user count - used for admin notifications
const getUserCount = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tính năng này'
      });
    }

    const { sql } = require('../config/database');
    const request = new sql.Request();
    
    // Get count of active users
    const result = await request.query(`
      SELECT COUNT(*) as count FROM Users
      WHERE is_active = 1
    `);
    
    const count = result.recordset[0].count;
    
    res.status(200).json({
      success: true,
      data: {
        count: count
      }
    });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy số lượng người dùng',
      error: error.message
    });
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
    deleteAccount,
    addToFavorites,
    removeFromFavorites,
    updateAvatar,
    getUserById,
    getUserPropertyCount,
    getUserFavoriteCount,
    getUserCount
};
