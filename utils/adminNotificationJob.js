const { sql } = require('../config/database');
const notificationController = require('../controllers/notificationController');

/**
 * Job để gửi thông báo admin đến người dùng theo lịch
 * - Kiểm tra các thông báo đang hoạt động (is_active = 1)
 * - Chỉ gửi thông báo có start_date <= ngày hiện tại và end_date >= ngày hiện tại hoặc end_date là null
 */
async function processScheduledAdminNotifications() {
  try {
    console.log('Đang chạy job xử lý thông báo từ admin...');
    
    const request = new sql.Request();
    
    // Lấy danh sách thông báo admin cần gửi
    const query = `
      SELECT id, title, message, target_type, target_users
      FROM AdminNotifications
      WHERE 
        is_active = 1
        AND start_date <= GETDATE()
        AND (end_date IS NULL OR end_date >= GETDATE())
    `;
    
    const result = await request.query(query);
    const adminNotifications = result.recordset;
    
    console.log(`Tìm thấy ${adminNotifications.length} thông báo admin cần xử lý`);
    
    // Gửi từng thông báo
    let totalSentCount = 0;
    
    for (const notification of adminNotifications) {
      try {
        const sentCount = await notificationController.sendAdminNotificationToUsers(notification.id);
        console.log(`Đã gửi thông báo "${notification.title}" đến ${sentCount} người dùng`);
        totalSentCount += sentCount;
      } catch (error) {
        console.error(`Lỗi khi xử lý thông báo admin ID ${notification.id}:`, error);
      }
    }
    
    console.log(`Tổng cộng đã gửi ${totalSentCount} thông báo đến người dùng`);
    
    return totalSentCount;
  } catch (error) {
    console.error('Lỗi khi xử lý thông báo admin theo lịch:', error);
    throw error;
  }
}

module.exports = {
  processScheduledAdminNotifications
}; 