const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { auth } = require("../middleware/auth");

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/verify-email", userController.verifyEmail);

// Protected routes
router.get("/profile", auth, userController.getUserProfile);
router.put("/profile", auth, userController.updateUserProfile);
router.put("/change-password", auth, userController.changePassword);
router.post("/logout", auth, userController.logout);

// User's properties and favorites
router.get("/properties", auth, userController.getUserProperties);
router.get("/favorites", auth, userController.getUserFavorites);

// User settings
router.get("/settings", auth, userController.getUserSettings);
router.put("/settings", auth, userController.updateUserSettings);

// User notifications
router.get("/notifications", auth, userController.getUserNotifications);
router.put("/notifications/read", auth, userController.markNotificationsAsRead);
router.delete("/notifications/:id", auth, userController.deleteNotification);

// Quên mật khẩu
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Xác thực email
router.post('/verify-email', userController.verifyEmail);
router.get('/resend-verification', auth, userController.resendVerification);

// Cài đặt thông báo
router.get('/notifications/settings', auth, userController.getNotificationSettings);
router.put('/notifications/settings', auth, userController.updateNotificationSettings);

// Đăng xuất
router.post('/logout', auth, userController.logout);

// Xóa tài khoản
router.delete('/profile', auth, userController.deleteAccount);

module.exports = router;
