const sql = require("mssql");
const dbConfig = {
    user: "sa",
    password: "Thong15102004",
    server: "localhost",
    database: "RealEstateDB",
    options: { encrypt: false, trustServerCertificate: true },
    port: 1433
};

// Đăng ký user
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Thiếu thông tin!" });
    }

    try {
        await sql.connect(dbConfig);
        const result = await sql.query(
            `INSERT INTO Users (username, email, password) 
             VALUES ('${username}', '${email}', '${password}')`
        );

        res.status(201).json({ message: "Đăng ký thành công!", user: { username, email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Đăng nhập user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Thiếu email hoặc mật khẩu!" });
    }

    try {
        await sql.connect(dbConfig);
        const result = await sql.query(
            `SELECT * FROM Users WHERE email='${email}' AND password='${password}'`
        );

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Sai email hoặc mật khẩu!" });
        }

        res.status(200).json({ message: "Đăng nhập thành công!", user: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registerUser, loginUser };
