const express = require("express");
const app = express();
const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ file .env

// Middleware parse JSON từ request
app.use(express.json());

// Cấu hình database
const dbConfig = {
    user: "sa",
    password: "Thong15102004",
    server: "localhost",
    port: 1433,
    database: "RealEstateDB",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Kết nối DB
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then((pool) => {
        console.log("✅ Connected to database!");
        return pool;
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    });

// Gán pool vào req
app.use((req, res, next) => {
    req.dbPool = poolPromise;
    next();
});

// Import routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/auth", userRoutes);

// Kiểm tra route gốc
app.get("/", (req, res) => {
    res.send("🚀 Server is running!");
});

// Khởi động server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
