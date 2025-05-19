const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { auth } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình multer để upload avatar
const avatarStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = 'uploads/avatars';
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Tạo tên file duy nhất dựa trên thời gian và ID người dùng
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'avatar-' + uniqueSuffix + ext);
    }
});

// Filter chỉ chấp nhận file hình ảnh
const avatarFilter = function(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ hỗ trợ file hình ảnh (jpeg, png, gif, webp)'), false);
    }
};

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter: avatarFilter
}).single('avatar');

// Auth routes (no authentication required)
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/verify-email", userController.verifyEmail);

// Profile routes (authentication required)
router.get("/profile", auth, userController.getUserProfile);
router.put("/profile", auth, userController.updateUserProfile);
router.post("/changePassword", auth, userController.changePassword);
router.delete("/profile", auth, userController.deleteAccount);

// Avatar route (authentication required)
router.options("/avatar", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).send();
});

router.post("/avatar", auth, function(req, res, next) {
    console.log('Avatar upload request received');
    console.log('User ID:', req.user ? req.user.id : 'undefined');
    console.log('Request headers:', req.headers);
    
    // Set CORS headers for the preflight response
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    uploadAvatar(req, res, function(err) {
        console.log('Multer processing complete');
        if (err instanceof multer.MulterError) {
            // Lỗi từ multer (ví dụ: file quá lớn)
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: `Lỗi upload ảnh: ${err.message}`
            });
        } else if (err) {
            // Lỗi khác
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        // Kiểm tra file
        console.log('File uploaded:', req.file);
        
        // Không có lỗi, tiếp tục xử lý controller
        next();
    });
}, userController.updateAvatar);

// Email verification (authentication required)
router.get("/resend-verification", auth, userController.resendVerification);

// Properties and favorites (authentication required)
router.get("/properties", auth, userController.getUserProperties);
router.get("/favorites", auth, userController.getUserFavorites);
router.post("/properties/favorites/:propertyId", auth, userController.addToFavorites);
router.delete("/properties/favorites/:propertyId", auth, userController.removeFromFavorites);

// Thêm routes mới để lấy số lượng tin đăng và yêu thích
router.get("/property-count", auth, userController.getUserPropertyCount);
router.get("/favorite-count", auth, userController.getUserFavoriteCount);

// Settings (authentication required)
router.get("/settings", auth, userController.getUserSettings);
router.put("/settings", auth, userController.updateUserSettings);

// Notifications (authentication required)
// Các route dưới đây được giữ lại để tương thích với mã cũ.
// Nên dùng API /api/notifications thay thế khi có thể
router.get("/notifications", auth, userController.getUserNotifications);
router.put("/notifications/read", auth, userController.markNotificationsAsRead);
router.delete("/notifications/:id", auth, userController.deleteNotification);
router.get("/notifications/settings", auth, userController.getNotificationSettings);
router.put("/notifications/settings", auth, userController.updateNotificationSettings);

// Logout (authentication required)
router.post("/logout", auth, userController.logout);

// Thêm route lấy thông tin người dùng theo ID
router.get("/:id", userController.getUserById);

module.exports = router;
