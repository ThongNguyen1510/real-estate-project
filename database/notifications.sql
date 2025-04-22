-- Bảng Notifications - Quản lý thông báo hệ thống và thông báo cá nhân
CREATE TABLE Notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    type NVARCHAR(50) NOT NULL,  -- system, property, message, review, etc.
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    related_entity_type NVARCHAR(50),  -- property, message, review, etc.
    related_entity_id INT,  -- ID của đối tượng liên quan
    is_read BIT DEFAULT 0,  -- 0: unread, 1: read
    created_at DATETIME DEFAULT GETDATE(),
    
    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_Notifications_User FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    -- Ràng buộc kiểm tra
    CONSTRAINT CHK_Notifications_Type CHECK (type IN ('system', 'property', 'message', 'review', 'other'))
);
GO

-- Bảng NotificationSettings - Quản lý cài đặt thông báo của người dùng
CREATE TABLE NotificationSettings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    email_notifications BIT DEFAULT 1,  -- Bật/tắt thông báo qua email
    push_notifications BIT DEFAULT 1,   -- Bật/tắt thông báo push
    sms_notifications BIT DEFAULT 0,    -- Bật/tắt thông báo qua SMS
    marketing_notifications BIT DEFAULT 1, -- Bật/tắt thông báo marketing
    property_updates BIT DEFAULT 1,     -- Bật/tắt thông báo về bất động sản đang theo dõi
    messages BIT DEFAULT 1,             -- Bật/tắt thông báo tin nhắn mới
    system_notifications BIT DEFAULT 1, -- Bật/tắt thông báo hệ thống
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME,
    
    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_NotificationSettings_User FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    -- Ràng buộc duy nhất
    CONSTRAINT UQ_NotificationSettings_User UNIQUE (user_id)
);
GO

-- Tạo các indices để tối ưu truy vấn
CREATE INDEX IX_Notifications_UserID ON Notifications(user_id);
CREATE INDEX IX_Notifications_IsRead ON Notifications(is_read);
CREATE INDEX IX_Notifications_Type ON Notifications(type);
CREATE INDEX IX_Notifications_CreatedAt ON Notifications(created_at);
GO

-- Tạo trigger tự động cập nhật updated_at
CREATE TRIGGER TR_NotificationSettings_UpdatedAt
ON NotificationSettings
AFTER UPDATE
AS
BEGIN
    IF NOT UPDATE(updated_at)
    BEGIN
        UPDATE NotificationSettings
        SET updated_at = GETDATE()
        FROM NotificationSettings ns
        INNER JOIN inserted i ON ns.id = i.id;
    END
END;
GO

-- Mẫu dữ liệu thông báo hệ thống (ví dụ)
INSERT INTO Notifications (user_id, type, title, content, related_entity_type, related_entity_id, is_read)
VALUES
    (1, 'system', N'Chào mừng bạn đến với hệ thống', N'Cảm ơn bạn đã tham gia hệ thống bất động sản của chúng tôi.', NULL, NULL, 0),
    (1, 'property', N'Cập nhật giá bất động sản', N'Bất động sản bạn đang theo dõi đã được cập nhật giá mới.', 'property', 1, 0),
    (1, 'message', N'Bạn có tin nhắn mới', N'Người dùng Nguyễn Văn A đã gửi cho bạn tin nhắn mới.', 'message', 1, 0);
GO

-- Mẫu dữ liệu cài đặt thông báo mặc định
INSERT INTO NotificationSettings (user_id, email_notifications, push_notifications, sms_notifications, marketing_notifications)
VALUES
    (1, 1, 1, 0, 1);
GO 