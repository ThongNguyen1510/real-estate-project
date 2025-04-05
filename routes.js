const express = require("express");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertiesRoutes");
const imageRoutes = require("./routes/imageRoutes");

const router = express.Router();

// User routes
router.use("/auth", userRoutes);

// Property routes
router.use("/properties", propertyRoutes);

// Image routes
router.use("/images", imageRoutes);

module.exports = router;
