const express = require("express");
const app = express();
const sql = require("mssql");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { updateExpiredProperties } = require('./utils/expirationJob');
const { processScheduledAdminNotifications } = require('./utils/adminNotificationJob');

dotenv.config(); // Tải các biến môi trường từ file .env

// Middleware để parse JSON từ request
app.use(express.json());

// Cấu hình CORS
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Cấu hình database
const dbConfig = {
    user: "sa",
    password: "Thong15102004",
    server: "localhost",
    port: 1433,
    database: "RealEstateDB",
    options: {
        encrypt: false, // Không mã hóa kết nối
        trustServerCertificate: true, // Tin tưởng chứng chỉ máy chủ
    },
};

// Kết nối DB
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then((pool) => {
        console.log("✅ Kết nối cơ sở dữ liệu thành công!");
        return pool;
    })
    .catch((err) => {
        console.error("❌ Kết nối cơ sở dữ liệu thất bại:", err);
        process.exit(1);
    });

// Gán pool vào req
app.use((req, res, next) => {
    req.dbPool = poolPromise;
    next();
});

// Middleware xác thực JWT
function authenticateToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ error: "Truy cập bị từ chối" });

    jwt.verify(token, "Thong15102004", (err, user) => {
        if (err) return res.status(403).json({ error: "Token không hợp lệ" });
        req.user = user;
        next();
    });
}

// 🏠 **IMPORT ROUTES**
const userRoutes = require("./routes/userRoutes");
const propertiesRoutes = require("./routes/propertiesRoutes");
const locationRoutes = require("./routes/locationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminNotificationRoutes = require("./routes/adminNotificationRoutes");

app.use("/api/auth", userRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);

// Kiểm tra route gốc
app.get("/", (req, res) => {
    res.send("🚀 Server đang chạy!");
});

// Khởi động job định kỳ để cập nhật các tin đăng hết hạn
// Chạy job mỗi giờ để kiểm tra và cập nhật tin đăng hết hạn
const ONE_HOUR = 60 * 60 * 1000; // 1 giờ tính bằng milliseconds
setInterval(async () => {
    try {
        const updatedCount = await updateExpiredProperties();
        console.log(`Job cập nhật tin đăng hết hạn đã chạy, ${updatedCount} tin đã được cập nhật.`);
    } catch (error) {
        console.error('Lỗi khi chạy job cập nhật tin đăng hết hạn:', error);
    }
}, ONE_HOUR);

// Job gửi thông báo admin
const FOUR_HOURS = 4 * 60 * 60 * 1000; // 4 giờ tính bằng milliseconds
setInterval(async () => {
    try {
        const sentCount = await processScheduledAdminNotifications();
        console.log(`Job gửi thông báo admin đã chạy, đã gửi ${sentCount} thông báo.`);
    } catch (error) {
        console.error('Lỗi khi chạy job gửi thông báo admin:', error);
    }
}, FOUR_HOURS);

// Chạy job ngay khi khởi động server
setTimeout(async () => {
    try {
        // Cập nhật tin đăng hết hạn
        const updatedCount = await updateExpiredProperties();
        console.log(`Job cập nhật tin đăng hết hạn đã chạy lần đầu, ${updatedCount} tin đã được cập nhật.`);
        
        // Gửi thông báo admin
        const sentCount = await processScheduledAdminNotifications();
        console.log(`Job gửi thông báo admin đã chạy lần đầu, đã gửi ${sentCount} thông báo.`);
    } catch (error) {
        console.error('Lỗi khi chạy job khởi động lần đầu:', error);
    }
}, 5000); // Chạy sau 5 giây khi server khởi động

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy trên cổng ${PORT}`));
