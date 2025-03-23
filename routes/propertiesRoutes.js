const express = require("express");
const {
  getProperties,
  addProperty,
  updateProperty,
  deleteProperty,
  searchProperties // Đảm bảo tên này khớp với tên export
} = require("../controllers/propertyController");

const router = express.Router();

// Define real estate API routes
router.get("/", getProperties);
router.post("/", addProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);
router.get("/search", searchProperties); // Đảm bảo hàm này được sử dụng đúng

module.exports = router;
