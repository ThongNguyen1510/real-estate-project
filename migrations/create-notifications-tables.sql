USE RealEstateDB;
GO

-- Tạo bảng Notifications nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notifications]') AND type in (N'U'))
BEGIN
    CREATE TABLE Notifications (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        notification_type NVARCHAR(50) NOT NULL, -- 'property_expired', 'admin', 'system', etc.
        reference_id INT NULL, -- ID tham chiếu (vd: property_id)
        is_read BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    PRINT 'Đã tạo bảng Notifications';
END
ELSE
BEGIN
    PRINT 'Bảng Notifications đã tồn tại';
END

-- Tạo bảng AdminNotifications để lưu trữ các thông báo của admin
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AdminNotifications]') AND type in (N'U'))
BEGIN
    CREATE TABLE AdminNotifications (
        id INT PRIMARY KEY IDENTITY(1,1),
        title NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        target_type NVARCHAR(50) NOT NULL, -- 'all_users', 'property_owners', 'specific_users'
        target_users NVARCHAR(MAX) NULL, -- JSON array có thể chứa user_ids trong trường hợp specific_users
        is_active BIT DEFAULT 1,
        start_date DATETIME DEFAULT GETDATE(),
        end_date DATETIME NULL,
        created_by INT NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME NULL,
        CONSTRAINT FK_AdminNotifications_Users FOREIGN KEY (created_by) REFERENCES Users(id)
    );
    
    PRINT 'Đã tạo bảng AdminNotifications';
END
ELSE
BEGIN
    PRINT 'Bảng AdminNotifications đã tồn tại';
END

-- Tạo bảng NotificationSettings nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NotificationSettings]') AND type in (N'U'))
BEGIN
    CREATE TABLE NotificationSettings (
        user_id INT PRIMARY KEY,
        email_notifications BIT DEFAULT 1,
        push_notifications BIT DEFAULT 1,
        sms_notifications BIT DEFAULT 0,
        property_expiration_notifications BIT DEFAULT 1,
        admin_notifications BIT DEFAULT 1,
        system_notifications BIT DEFAULT 1,
        updated_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_NotificationSettings_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    PRINT 'Đã tạo bảng NotificationSettings';
END
ELSE
BEGIN
    PRINT 'Bảng NotificationSettings đã tồn tại';
END
GO 