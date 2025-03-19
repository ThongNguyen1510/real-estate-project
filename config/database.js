const sql = require('mssql');

const config = {
    user: 'sa', // Replace with your SQL Server username
    password: 'Thong15102004', // Replace with your SQL Server password
    server: 'localhost', // Replace with your SQL Server host
    database: 'RealEstateDB', // Replace with your database name
    options: {
        encrypt: false, // Set to true if using Azure or encrypted connections
        trustServerCertificate: true // Required for self-signed certificates
    }
};

let poolConnection;

const connectToDatabase = async () => {
    if (!poolConnection) {
        poolConnection = await sql.connect(config);
        console.log('✅ Kết nối cơ sở dữ liệu thành công!');
    }
    return poolConnection;
};

module.exports = {
    connectToDatabase,
    sql
};
