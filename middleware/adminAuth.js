/**
 * Middleware để kiểm tra quyền admin
 * Phải dùng sau middleware auth
 */
const adminAuth = (req, res, next) => {
    // Kiểm tra xem người dùng đã được xác thực chưa
    if (!req.user) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    // Kiểm tra quyền admin
    if (!req.user.is_admin) {
        return res.status(403).json({ error: 'Không có quyền truy cập. Chỉ admin mới được phép thực hiện thao tác này.' });
    }

    // Nếu là admin, cho phép tiếp tục
    next();
};

module.exports = adminAuth; 