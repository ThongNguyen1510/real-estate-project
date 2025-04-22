## Di chuyển dữ liệu thông báo

Hệ thống đã được chuẩn hóa để sử dụng các bảng `Notifications` và `NotificationSettings` thay vì các bảng cũ `UserNotifications` và phần thông báo trong `UserSettings`. 

Để di chuyển dữ liệu từ các bảng cũ sang bảng mới, chạy script SQL trong file:

```
database/migrations/migrate_usernotifications_to_notifications.sql
```

Các API thông báo nên được truy cập qua:
- `GET /api/notifications` - Lấy danh sách thông báo
- `GET /api/notifications/unread-count` - Lấy số thông báo chưa đọc
- `PUT /api/notifications/mark-all-read` - Đánh dấu tất cả thông báo đã đọc
- `PUT /api/notifications/:id/read` - Đánh dấu thông báo đã đọc
- `DELETE /api/notifications/:id` - Xóa thông báo
- `GET /api/notifications/settings` - Lấy cài đặt thông báo
- `PUT /api/notifications/settings` - Cập nhật cài đặt thông báo 