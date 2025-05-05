# API Thông báo (Notifications API)

API thông báo trong ứng dụng bất động sản cung cấp các endpoint để quản lý và theo dõi các thông báo của người dùng.

## Base URL

```
/api/notifications
```

> **LƯU Ý:** Tất cả các endpoint đều yêu cầu xác thực bằng JWT token.

## Endpoints chung

### Lấy danh sách thông báo

```
GET /api/notifications
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số thông báo trên mỗi trang (mặc định: 20)
- `is_read`: Lọc theo trạng thái đã đọc (true) hoặc chưa đọc (false)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 123,
        "user_id": 456,
        "type": "message",
        "title": "Tin nhắn mới",
        "content": "Bạn có tin nhắn mới từ người dùng xyz",
        "related_id": 789,
        "is_read": false,
        "created_at": "2023-07-15T08:30:45.000Z"
      },
      // ...
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

### Lấy số lượng thông báo chưa đọc

```
GET /api/notifications/unread-count
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "unread_count": 15
  }
}
```

### Đánh dấu thông báo đã đọc

```
PUT /api/notifications/:id/read
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã đánh dấu thông báo đã đọc"
}
```

### Đánh dấu tất cả thông báo đã đọc

```
PUT /api/notifications/read-all
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã đánh dấu tất cả thông báo đã đọc"
}
```

### Xóa thông báo

```
DELETE /api/notifications/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã xóa thông báo"
}
```

## Endpoints cài đặt thông báo

### Lấy cài đặt thông báo

```
GET /api/notifications/settings
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "email_notifications": true,
    "push_notifications": true,
    "property_matches": true,
    "price_changes": true,
    "messages": true,
    "appointments": true,
    "system_notifications": true,
    "listing_status_changes": true,
    "listing_expirations": true,
    "reports": true
  }
}
```

### Cập nhật cài đặt thông báo

```
PUT /api/notifications/settings
```

**Dữ liệu request:**
```json
{
  "email_notifications": true,
  "push_notifications": false,
  "property_matches": true,
  "price_changes": true,
  "messages": true,
  "appointments": true,
  "system_notifications": false,
  "listing_status_changes": true,
  "listing_expirations": true,
  "reports": false
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã cập nhật cài đặt thông báo"
}
```

## Endpoints theo loại thông báo

### Lấy thông báo về bất động sản phù hợp

```
GET /api/notifications/matching-properties
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số thông báo trên mỗi trang (mặc định: 20)

**Phản hồi thành công:** Tương tự với endpoint lấy danh sách thông báo.

### Lấy thông báo về thay đổi giá

```
GET /api/notifications/price-changes
```

**Tham số query:** Tương tự như trên.

### Lấy thông báo tin nhắn

```
GET /api/notifications/messages
```

**Tham số query:** Tương tự như trên.

### Lấy thông báo cuộc hẹn

```
GET /api/notifications/appointments
```

**Tham số query:** Tương tự như trên.

### Lấy thông báo hệ thống

```
GET /api/notifications/system
```

**Tham số query:** Tương tự như trên.

### Lấy thông báo về trạng thái tin đăng

```
GET /api/notifications/listing-status
```

**Tham số query:** Tương tự như trên.

### Lấy thông báo về tin đăng sắp hết hạn

```
GET /api/notifications/expiration
```

**Tham số query:** Tương tự như trên.

### Lấy thông báo về báo cáo tin đăng

```
GET /api/notifications/reports
```

**Tham số query:** Tương tự như trên.

## Mã lỗi

- `400 Bad Request`: Yêu cầu không hợp lệ
- `401 Unauthorized`: Không được xác thực
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `500 Internal Server Error`: Lỗi máy chủ 