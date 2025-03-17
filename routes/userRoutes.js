const express = require("express");
const router = express.Router();
const sql = require("mssql");
const bcrypt = require("bcryptjs"); 

// Kiểm tra file có được load không
console.log("✅ userRoutes loaded!");

// Đăng ký user mới
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // Mã hóa mật khẩu
        const pool = await req.dbPool;

        const result = await pool.request()
            .input("name", sql.NVarChar, name)
            .input("email", sql.NVarChar, email)
            .input("password", sql.NVarChar, hashedPassword)
            .input("phone", sql.NVarChar, phone)
            .input("role", sql.NVarChar, role)
            .query("INSERT INTO Users (name, email, password, phone, role) VALUES (@name, @email, @password, @phone, @role)");

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// Đăng nhập user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = await req.dbPool;

        const result = await pool.request()
            .input("email", sql.NVarChar, email)
            .query("SELECT * FROM Users WHERE email = @email");

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({ message: "Login successful", user });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
