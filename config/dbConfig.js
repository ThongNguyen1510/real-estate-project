module.exports = {
    user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "Thong15102004",
    server: process.env.DB_SERVER || "localhost",
    database: process.env.DB_NAME || "RealEstateDB",
    options: {
        encrypt: false, // Không mã hóa kết nối
        trustServerCertificate: true, // Tin tưởng chứng chỉ máy chủ
    },
    port: Number(process.env.DB_PORT) || 1433, // Cổng kết nối SQL Server
};
