const express = require("express");
const {
  getProperties,
  addProperty,
  updateProperty,
  deleteProperty,
  searchProperties
} = require("../controllers/propertyController");

const router = express.Router();

// Define real estate API routes
router.get("/", getProperties);
router.post("/", addProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);
router.get("/search", searchProperties);

module.exports = router;
