-- Script SQL di chuyển dữ liệu từ bảng UserNotifications sang Notifications
-- Tạo ngày 2023-10-20

-- Kiểm tra xem bảng UserNotifications có tồn tại không
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserNotifications]') AND type in (N'U'))
BEGIN
    -- Thêm dữ liệu từ UserNotifications vào Notifications
    INSERT INTO Notifications (
        user_id,
        type,
        title,
        content,
        related_entity_type,
        related_entity_id,
        is_read,
        created_at
    )
    SELECT 
        user_id,
        'system' as type, -- Mặc định type là system
        title,
        content,
        NULL as related_entity_type, -- Có thể thay đổi dựa vào cấu trúc thực tế của UserNotifications
        NULL as related_entity_id,   -- Có thể thay đổi dựa vào cấu trúc thực tế của UserNotifications
        is_read,
        created_at
    FROM UserNotifications
    WHERE NOT EXISTS (
        -- Tránh duplicate khi chạy script nhiều lần
        SELECT 1 FROM Notifications n
        WHERE n.user_id = UserNotifications.user_id
        AND n.title = UserNotifications.title
        AND n.content = UserNotifications.content
        AND n.created_at = UserNotifications.created_at
    );

    PRINT 'Đã di chuyển dữ liệu từ UserNotifications sang Notifications.';
END
ELSE
BEGIN
    PRINT 'Bảng UserNotifications không tồn tại, không cần di chuyển dữ liệu.';
END

-- Kiểm tra xem bảng UserSettings có tồn tại không
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSettings]') AND type in (N'U'))
BEGIN
    -- Thêm dữ liệu từ UserSettings vào NotificationSettings
    INSERT INTO NotificationSettings (
        user_id,
        email_notifications,
        push_notifications,
        sms_notifications,
        marketing_notifications,
        property_updates,
        messages,
        transaction_updates,
        system_notifications,
        created_at,
        updated_at
    )
    SELECT 
        user_id,
        notification_email as email_notifications,
        1 as push_notifications, -- Mặc định bật
        notification_sms as sms_notifications,
        1 as marketing_notifications, -- Mặc định bật
        1 as property_updates, -- Mặc định bật
        1 as messages, -- Mặc định bật
        1 as transaction_updates, -- Mặc định bật
        1 as system_notifications, -- Mặc định bật
        GETDATE() as created_at,
        GETDATE() as updated_at
    FROM UserSettings
    WHERE NOT EXISTS (
        -- Tránh duplicate khi chạy script nhiều lần
        SELECT 1 FROM NotificationSettings ns
        WHERE ns.user_id = UserSettings.user_id
    );

    PRINT 'Đã di chuyển dữ liệu từ UserSettings sang NotificationSettings.';
END
ELSE
BEGIN
    PRINT 'Bảng UserSettings không tồn tại, không cần di chuyển dữ liệu.';
END 