require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false, // Set to true if using Azure or encrypted connections
        trustServerCertificate: true // Required for self-signed certificates
    }
};

let poolConnection; // Khởi tạo poolConnection                  

const connectToDatabase = async () => {
    try {
        if (!poolConnection) {
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
