const { sql } = require('../config/database');

const notificationModel = {
    // Lấy danh sách thông báo của người dùng
    async getUserNotifications(userId, params = {}) {
        try {
            const page = params.page || 1;
            const limit = params.limit || 10;
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT 
                    id,
                    user_id,
                    title,
                    message,
                    notification_type,
                    reference_id,
                    is_read,
                    is_featured,
                    created_at
                FROM Notifications
                WHERE user_id = @userId
            `;
            
            // Lọc theo đã đọc hoặc chưa đọc
            if (params.read_status !== undefined) {
                query += ` AND is_read = @read_status`;
            }
            
            // Lọc theo loại thông báo
            if (params.type) {
                query += ` AND notification_type = @type`;
            }
            
            // Sắp xếp mới nhất trước
            query += ` ORDER BY created_at DESC`;
            
            // Phân trang
            query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
            
            const request = new sql.Request();
            request.input('userId', sql.Int, userId);
            
            if (params.read_status !== undefined) {
                request.input('read_status', sql.Bit, params.read_status ? 1 : 0);
            }
            
            if (params.type) {
                request.input('type', sql.NVarChar, params.type);
            }
            
            const result = await request.query(query);
            
            // Đếm tổng số thông báo để phân trang
            const countQuery = `
                SELECT COUNT(*) AS total
                FROM Notifications
                WHERE user_id = @userId
                ${params.read_status !== undefined ? ' AND is_read = @read_status' : ''}
                ${params.type ? ' AND notification_type = @type' : ''}
            `;
            
            const countResult = await request.query(countQuery);
            const total = countResult.recordset[0].total;
            
            return {
                notifications: result.recordset,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting user notifications:', error);
            throw error;
        }
    },
    
    // Lấy số lượng thông báo chưa đọc
    async getUnreadCount(userId) {
        try {
            const result = await sql.query`
                SELECT COUNT(*) AS unread_count
                FROM Notifications
                WHERE user_id = ${userId}
                AND is_read = 0
            `;
            
            return result.recordset[0].unread_count;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    },
    
    // Tạo thông báo mới
    async createNotification(notificationData) {
        try {
            const request = new sql.Request();
            request.input('user_id', sql.Int, notificationData.user_id);
            request.input('title', sql.NVarChar, notificationData.title);
            request.input('message', sql.NVarChar, notificationData.message);
            request.input('notification_type', sql.NVarChar, notificationData.notification_type);
            request.input('reference_id', sql.Int, notificationData.reference_id || null);
            request.input('is_featured', sql.Bit, notificationData.is_featured || false);
            
            const result = await request.query(`
                INSERT INTO Notifications (
                    user_id,
                    title,
                    message,
                    notification_type,
                    reference_id,
                    is_read,
                    is_featured,
                    created_at
                )
                VALUES (
                    @user_id,
                    @title,
                    @message,
                    @notification_type,
                    @reference_id,
                    0,
                    @is_featured,
                    GETDATE()
                );
                
                SELECT SCOPE_IDENTITY() AS id;
            `);
            
            return result.recordset[0].id;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },
    
    // Tạo thông báo về tin đăng hết hạn
    async createPropertyExpirationNotification(property) {
        try {
            const notificationData = {
                user_id: property.owner_id,
                title: 'Tin đăng đã hết hạn',
                message: `Tin đăng "${property.title}" của bạn đã hết hạn. Hãy gia hạn để tin tiếp tục hiển thị trên trang chủ.`,
                notification_type: 'property_expired',
                reference_id: property.id
            };
            
            return await this.createNotification(notificationData);
        } catch (error) {
            console.error('Error creating property expiration notification:', error);
            throw error;
        }
    },
    
    // Tạo thông báo cho người dùng từ thông báo admin
    async createAdminNotification(userId, adminNotification) {
        try {
            const notificationData = {
                user_id: userId,
                title: adminNotification.title,
                message: adminNotification.message,
                notification_type: 'admin',
                reference_id: adminNotification.id,
                is_featured: adminNotification.is_featured || false
            };
            
            return await this.createNotification(notificationData);
        } catch (error) {
            console.error('Error creating admin notification for user:', error);
            throw error;
        }
    },
    
    // Đánh dấu thông báo đã đọc
    async markAsRead(notificationId, userId) {
        try {
            const result = await sql.query`
                UPDATE Notifications
                SET 
                    is_read = 1
                WHERE id = ${notificationId}
                AND user_id = ${userId}
            `;
            
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },
    
    // Đánh dấu tất cả thông báo đã đọc
    async markAllAsRead(userId) {
        try {
            const result = await sql.query`
                UPDATE Notifications
                SET 
                    is_read = 1
                WHERE user_id = ${userId}
                AND is_read = 0
            `;
            
            return result.rowsAffected[0];
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },
    
    // Xóa thông báo
    async deleteNotification(notificationId, userId) {
        try {
            const result = await sql.query`
                DELETE FROM Notifications
                WHERE id = ${notificationId}
                AND user_id = ${userId}
            `;
            
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },
    
    // Lấy cài đặt thông báo của người dùng
    async getNotificationSettings(userId) {
        try {
            const result = await sql.query`
                SELECT 
                    email_notifications,
                    push_notifications,
                    sms_notifications,
                    property_expiration_notifications,
                    admin_notifications,
                    system_notifications
                FROM NotificationSettings
                WHERE user_id = ${userId}
            `;
            
            if (result.recordset.length === 0) {
                // Tạo cài đặt mặc định
                await this.createDefaultSettings(userId);
                return {
                    email_notifications: true,
                    push_notifications: true,
                    sms_notifications: false,
                    property_expiration_notifications: true,
                    admin_notifications: true,
                    system_notifications: true
                };
            }
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error getting notification settings:', error);
            throw error;
        }
    },
    
    // Tạo cài đặt thông báo mặc định
    async createDefaultSettings(userId) {
        try {
            await sql.query`
                INSERT INTO NotificationSettings (
                    user_id,
                    email_notifications,
                    push_notifications,
                    sms_notifications,
                    property_expiration_notifications,
                    admin_notifications,
                    system_notifications,
                    updated_at
                )
                VALUES (
                    ${userId},
                    1, 1, 0, 1, 1, 1,
                    GETDATE()
                )
            `;
            
            return true;
        } catch (error) {
            console.error('Error creating default notification settings:', error);
            throw error;
        }
    },
    
    // Cập nhật cài đặt thông báo
    async updateNotificationSettings(userId, settings) {
        try {
            // Kiểm tra settings có tồn tại không
            const checkResult = await sql.query`
                SELECT COUNT(*) as count
                FROM NotificationSettings
                WHERE user_id = ${userId}
            `;
            
            // Nếu không tồn tại thì tạo mới
            if (checkResult.recordset[0].count === 0) {
                await sql.query`
                    INSERT INTO NotificationSettings (
                        user_id,
                        email_notifications,
                        push_notifications,
                        sms_notifications,
                        property_expiration_notifications,
                        admin_notifications,
                        system_notifications,
                        updated_at
                    )
                    VALUES (
                        ${userId},
                        ${settings.email_notifications ? 1 : 0},
                        ${settings.push_notifications ? 1 : 0},
                        ${settings.sms_notifications ? 1 : 0},
                        ${settings.property_expiration_notifications ? 1 : 0},
                        ${settings.admin_notifications ? 1 : 0},
                        ${settings.system_notifications ? 1 : 0},
                        GETDATE()
                    )
                `;
            } else {
                // Nếu tồn tại thì cập nhật
                await sql.query`
                    UPDATE NotificationSettings
                    SET 
                        email_notifications = ${settings.email_notifications ? 1 : 0},
                        push_notifications = ${settings.push_notifications ? 1 : 0},
                        sms_notifications = ${settings.sms_notifications ? 1 : 0},
                        property_expiration_notifications = ${settings.property_expiration_notifications ? 1 : 0},
                        admin_notifications = ${settings.admin_notifications ? 1 : 0},
                        system_notifications = ${settings.system_notifications ? 1 : 0},
                        updated_at = GETDATE()
                    WHERE user_id = ${userId}
                `;
            }
            
            return true;
        } catch (error) {
            console.error('Error updating notification settings:', error);
            throw error;
        }
    },
    
    // Tạo thông báo về tin đăng sắp hết hạn
    async createPropertyExpiringNotification(property) {
        try {
            const notificationData = {
                user_id: property.owner_id,
                title: 'Tin đăng sắp hết hạn',
                message: `Tin đăng "${property.title}" của bạn sẽ hết hạn trong 3 ngày nữa. Hãy gia hạn để tin tiếp tục hiển thị trên trang chủ.`,
                notification_type: 'property_expiring_soon',
                reference_id: property.id
            };
            
            return await this.createNotification(notificationData);
        } catch (error) {
            console.error('Error creating property expiring soon notification:', error);
            throw error;
        }
    },
    
    // Tạo thông báo về báo cáo được chấp nhận
    async createReportApprovedNotification(reportData) {
        try {
            const notificationData = {
                user_id: reportData.reporter_id,
                title: 'Báo cáo đã được chấp nhận',
                message: `Báo cáo của bạn về "${reportData.property_title}" đã được quản trị viên chấp nhận. Cảm ơn bạn đã góp phần xây dựng cộng đồng tốt đẹp hơn.`,
                notification_type: 'report_approved',
                reference_id: reportData.id
            };
            
            return await this.createNotification(notificationData);
        } catch (error) {
            console.error('Error creating report approved notification:', error);
            throw error;
        }
    },
    
    // Tạo thông báo về báo cáo bị từ chối
    async createReportRejectedNotification(reportData) {
        try {
            const notificationData = {
                user_id: reportData.reporter_id,
                title: 'Báo cáo đã bị từ chối',
                message: `Báo cáo của bạn về "${reportData.property_title}" đã bị từ chối bởi quản trị viên. Vui lòng xem lại nội dung báo cáo.`,
                notification_type: 'report_rejected',
                reference_id: reportData.id
            };
            
            return await this.createNotification(notificationData);
        } catch (error) {
            console.error('Error creating report rejected notification:', error);
            throw error;
        }
    },
    
    // Tạo thông báo về tin đăng được yêu thích
    async createPropertyFavoritedNotification(propertyId, userId, favoriterName) {
        try {
            // Lấy thông tin tin đăng trước
            const request = new sql.Request();
            request.input('propertyId', sql.Int, propertyId);
            
            const propertyResult = await request.query(`
                SELECT id, title, owner_id 
                FROM Properties 
                WHERE id = @propertyId
            `);
            
            if (propertyResult.recordset.length === 0) {
                throw new Error('Property not found');
            }
            
            const property = propertyResult.recordset[0];
            
            // Tạo thông báo cho chủ tin đăng
            const notificationData = {
                user_id: property.owner_id,
                title: 'Tin đăng được yêu thích',
                message: `"${favoriterName}" đã thêm tin đăng "${property.title}" vào danh sách yêu thích.`,
                notification_type: 'property_favorited',
                reference_id: propertyId
            };
            
            return await this.createNotification(notificationData);
        } catch (error) {
            console.error('Error creating property favorited notification:', error);
            throw error;
        }
    }
};

module.exports = notificationModel; 