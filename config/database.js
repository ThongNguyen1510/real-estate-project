require('dotenv').config();
const sql = require('mssql');

// In thông tin cấu hình database để debug
console.log('Database Config:', {
    user: process.env.DB_USER || 'undefined',
    password: process.env.DB_PASSWORD ? '[HIDDEN]' : 'undefined',
    server: process.env.DB_SERVER || 'undefined',
    database: process.env.DB_NAME || 'undefined'
});

// Sử dụng giá trị cứng nếu biến môi trường không tồn tại
const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Thong15102004',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'RealEstateDB',
    options: {
        encrypt: false, // Set to true if using Azure or encrypted connections
        trustServerCertificate: true // Required for self-signed certificates
    }
};

let poolConnection; // Khởi tạo poolConnection                  

const connectToDatabase = async () => {
    try {
        if (!poolConnection) {
            console.log('Attempting to connect to database with config:', {
                user: config.user,
                password: '[HIDDEN]',
                server: config.server,
                database: config.database
            });
            
            poolConnection = await sql.connect(config);
            console.log('✅ Kết nối cơ sở dữ liệu thành công!');
        }
        return poolConnection;
    } catch (error) {
        console.error('❌ Lỗi kết nối cơ sở dữ liệu:', error);
        throw error;
    }
};

module.exports = {
    connectToDatabase,
    sql
};
