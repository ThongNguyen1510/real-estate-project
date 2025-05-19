const { sql } = require('../config/database');
const notificationController = require('../controllers/notificationController');

/**
 * Job để cập nhật tự động trạng thái các tin đăng đã hết hạn
 * Chuyển trạng thái từ 'available' sang 'expired'
 * Và gửi thông báo cho chủ tin đăng
 */
async function updateExpiredProperties() {
  try {
    console.log('Đang chạy job cập nhật tin đăng hết hạn...');
    
    // Trước tiên lấy danh sách các tin đăng sắp hết hạn để gửi thông báo
    const request = new sql.Request();
    
    // Lấy danh sách tin đăng đã hết hạn nhưng chưa được cập nhật trạng thái
    const expiredQuery = `
      SELECT id, title, owner_id
      FROM Properties
      WHERE 
        status = 'available' 
        AND expires_at IS NOT NULL 
        AND expires_at < GETDATE()
    `;
    
    const expiredResult = await request.query(expiredQuery);
    const expiredProperties = expiredResult.recordset;
    
    // Cập nhật trạng thái các tin đăng đã hết hạn
    const updateQuery = `
      UPDATE Properties
      SET status = 'expired'
      WHERE 
        status = 'available' 
        AND expires_at IS NOT NULL 
        AND expires_at < GETDATE()
    `;
    
    const updateResult = await request.query(updateQuery);
    
    console.log(`Đã cập nhật ${updateResult.rowsAffected[0]} tin đăng hết hạn`);
    
    // Gửi thông báo cho chủ tin đăng
    let notificationCount = 0;
    
    for (const property of expiredProperties) {
      try {
        await notificationController.createPropertyExpirationNotification(property);
        notificationCount++;
      } catch (error) {
        console.error(`Lỗi khi gửi thông báo cho tin đăng ID ${property.id}:`, error);
      }
    }
    
    console.log(`Đã gửi ${notificationCount} thông báo hết hạn tin đăng`);
    
    return updateResult.rowsAffected[0];
  } catch (error) {
    console.error('Lỗi khi cập nhật tin đăng hết hạn:', error);
    throw error;
  }
}

module.exports = {
  updateExpiredProperties
}; 