const express = require("express");
const sql = require("mssql");

const router = express.Router();

// Lấy danh sách BĐS
router.get("/", async (req, res) => {
    try {
        console.log("📥 Nhận request lấy danh sách BĐS...");
        
        // Lấy pool kết nối DB từ server.js
        const pool = await req.dbPool;  

        // Query lấy danh sách BĐS
        const result = await pool.request().query("SELECT * FROM Properties");

        console.log("✅ Lấy danh sách BĐS thành công!");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách BĐS:", err);
        res.status(500).json({ error: "Lỗi server!", details: err.message });
    }
});

// Export route
module.exports = router;
