const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { auth } = require("../middleware/auth");

// Auth routes (no authentication required)
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/verify-email", userController.verifyEmail);

// Profile routes (authentication required)
router.get("/profile", auth, userController.getUserProfile);
router.put("/profile", auth, userController.updateUserProfile);
router.put("/change-password", auth, userController.changePassword);
router.delete("/profile", auth, userController.deleteAccount);

// Email verification (authentication required)
router.get("/resend-verification", auth, userController.resendVerification);

// Properties and favorites (authentication required)
router.get("/properties", auth, userController.getUserProperties);
router.get("/favorites", auth, userController.getUserFavorites);
router.post("/properties/favorites/:propertyId", auth, userController.addToFavorites);
router.delete("/properties/favorites/:propertyId", auth, userController.removeFromFavorites);

// Settings (authentication required)
router.get("/settings", auth, userController.getUserSettings);
router.put("/settings", auth, userController.updateUserSettings);

// Notifications (authentication required)
router.get("/notifications", auth, userController.getUserNotifications);
router.put("/notifications/read", auth, userController.markNotificationsAsRead);
router.delete("/notifications/:id", auth, userController.deleteNotification);
router.get("/notifications/settings", auth, userController.getNotificationSettings);
router.put("/notifications/settings", auth, userController.updateNotificationSettings);

// Logout (authentication required)
router.post("/logout", auth, userController.logout);

module.exports = router;
