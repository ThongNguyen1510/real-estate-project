const express = require("express");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertiesRoutes");
const imageRoutes = require("./routes/imageRoutes");
const notificationController = require('./controllers/notificationController');

const router = express.Router();

// User routes
router.use("/auth", userRoutes);

// Property routes
router.use("/properties", propertyRoutes);

// Image routes
router.use("/images", imageRoutes);

// Global featured notification endpoint (không yêu cầu xác thực)
router.get('/api/global-featured-notification', notificationController.getGlobalFeaturedNotification);

module.exports = router;
