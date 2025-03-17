require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sql = require("mssql");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 9000;

// Kết nối tới database
const dbConfig = {
  user: process.env.DB_USER || "sa", 
  password: process.env.DB_PASSWORD || "your_password",
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "RealEstateDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  port: Number(process.env.DB_PORT) || 1433
};

async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log("✅ Connected to database!");

    // Chỉ khởi động server khi kết nối DB thành công
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // Dừng ứng dụng nếu kết nối DB thất bại
  }
}

connectDB();

// Test API
app.get("/", (req, res) => {
  res.send("API is running...");
});
