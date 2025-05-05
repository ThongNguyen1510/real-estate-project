# API Tin nhắn (Message API)

API tin nhắn cung cấp các endpoint để gửi và quản lý tin nhắn giữa người dùng trong ứng dụng bất động sản.

## Base URL

```
/api/messages
```

> **LƯU Ý:** Tất cả các endpoint đều yêu cầu xác thực bằng JWT token.

## Endpoints cuộc hội thoại

### Lấy danh sách cuộc hội thoại

```
GET /api/messages/conversations
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số cuộc hội thoại trên mỗi trang (mặc định: 20)
- `search`: Tìm kiếm theo tên người dùng (không bắt buộc)
- `unread_only`: Chỉ hiển thị các cuộc hội thoại có tin nhắn chưa đọc (true/false, mặc định: false)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 123,
        "participant": {
          "id": 456,
          "fullname": "Nguyễn Văn A",
          "avatar": "https://example.com/avatars/456.jpg"
        },
        "property": {
          "id": 789,
          "title": "Căn hộ cao cấp tại The Manor",
          "image": "https://example.com/images/property789_1.jpg"
        },
        "last_message": {
          "content": "Tôi có thể hẹn xem nhà vào ngày mai được không?",
          "created_at": "2023-07-15T08:30:45.000Z",
          "sender_id": 456,
          "is_read": false
        },
        "unread_count": 2,
        "created_at": "2023-07-10T10:15:30.000Z",
        "updated_at": "2023-07-15T08:30:45.000Z"
      },
      // ...
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 45,
      "items_per_page": 20
    }
  }
}
```

### Tạo cuộc hội thoại mới

```
POST /api/messages/conversations
```

**Dữ liệu request:**
```json
{
  "recipient_id": 456,
  "property_id": 789,
  "initial_message": "Tôi quan tâm đến bất động sản của bạn, bạn có thể cho tôi biết thêm chi tiết không?"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã tạo cuộc hội thoại mới",
  "data": {
    "conversation_id": 123,
    "message_id": 10001
  }
}
```

### Xóa cuộc hội thoại

```
DELETE /api/messages/conversations/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã xóa cuộc hội thoại"
}
```

## Endpoints tin nhắn

### Lấy tin nhắn của cuộc hội thoại

```
GET /api/messages/conversations/:id
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số tin nhắn trên mỗi trang (mặc định: 50)
- `before`: Lấy tin nhắn trước thời điểm này (định dạng ISO 8601, không bắt buộc)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": 123,
      "participant": {
        "id": 456,
        "fullname": "Nguyễn Văn A",
        "avatar": "https://example.com/avatars/456.jpg",
        "phone": "0912345678",
        "email": "example@example.com"
      },
      "property": {
        "id": 789,
        "title": "Căn hộ cao cấp tại The Manor",
        "address": "91 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. HCM",
        "image": "https://example.com/images/property789_1.jpg",
        "price": 2000000000,
        "transaction_type": "sale"
      },
      "created_at": "2023-07-10T10:15:30.000Z"
    },
    "messages": [
      {
        "id": 10001,
        "sender_id": 123,
        "sender_name": "Trần Văn B",
        "content": "Tôi quan tâm đến bất động sản của bạn, bạn có thể cho tôi biết thêm chi tiết không?",
        "is_read": true,
        "created_at": "2023-07-10T10:15:30.000Z"
      },
      {
        "id": 10002,
        "sender_id": 456,
        "sender_name": "Nguyễn Văn A",
        "content": "Chào bạn, đây là căn hộ 2 phòng ngủ, 2 phòng tắm, diện tích 85m2. Đã có sổ hồng và sẵn sàng giao dịch.",
        "is_read": true,
        "created_at": "2023-07-10T10:20:45.000Z"
      },
      {
        "id": 10003,
        "sender_id": 123,
        "sender_name": "Trần Văn B",
        "content": "Cảm ơn bạn, tôi có thể hẹn xem nhà được không?",
        "is_read": true,
        "created_at": "2023-07-10T10:25:15.000Z"
      },
      {
        "id": 10004,
        "sender_id": 456,
        "sender_name": "Nguyễn Văn A",
        "content": "Được bạn, bạn có thể đến xem vào thứ 7 này không?",
        "is_read": true,
        "created_at": "2023-07-10T10:30:30.000Z"
      },
      {
        "id": 10005,
        "sender_id": 123,
        "sender_name": "Trần Văn B",
        "content": "Tôi có thể hẹn xem nhà vào ngày mai được không?",
        "is_read": false,
        "created_at": "2023-07-15T08:30:45.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 5,
      "items_per_page": 50
    }
  }
}
```

### Gửi tin nhắn

```
POST /api/messages/conversations/:id
```

**Dữ liệu request:**
```json
{
  "content": "Tôi đồng ý với giá này, khi nào chúng ta có thể gặp để thảo luận thêm?"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã gửi tin nhắn thành công",
  "data": {
    "message": {
      "id": 10006,
      "sender_id": 123,
      "sender_name": "Trần Văn B",
      "content": "Tôi đồng ý với giá này, khi nào chúng ta có thể gặp để thảo luận thêm?",
      "is_read": false,
      "created_at": "2023-07-15T09:45:30.000Z"
    }
  }
}
```

### Đánh dấu tin nhắn đã đọc

```
PUT /api/messages/conversations/:id/read
```

**Dữ liệu request:**
```json
{
  "message_id": 10005
}
```

Hoặc đánh dấu tất cả tin nhắn trong cuộc hội thoại:

```json
{
  "all": true
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã đánh dấu tin nhắn đã đọc"
}
```

### Xóa tin nhắn

```
DELETE /api/messages/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã xóa tin nhắn"
}
```

## Endpoints thông báo tin nhắn

### Đăng ký thiết bị nhận thông báo

```
POST /api/messages/device-tokens
```

**Dữ liệu request:**
```json
{
  "device_token": "fcm_token_here",
  "device_type": "android" // hoặc "ios", "web"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã đăng ký thiết bị nhận thông báo"
}
```

### Hủy đăng ký thiết bị

```
DELETE /api/messages/device-tokens/:token
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã hủy đăng ký thiết bị nhận thông báo"
}
```

## Cài đặt tin nhắn

### Lấy cài đặt tin nhắn

```
GET /api/messages/settings
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "email_notification": true,
      "push_notification": true,
      "auto_reply": false,
      "auto_reply_message": "",
      "blocked_users": [
        {
          "id": 789,
          "fullname": "Lê Văn C"
        }
      ]
    }
  }
}
```

### Cập nhật cài đặt tin nhắn

```
PUT /api/messages/settings
```

**Dữ liệu request:**
```json
{
  "email_notification": true,
  "push_notification": false,
  "auto_reply": true,
  "auto_reply_message": "Cảm ơn bạn đã liên hệ. Tôi sẽ phản hồi sớm nhất có thể."
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã cập nhật cài đặt tin nhắn"
}
```

### Chặn người dùng

```
POST /api/messages/block
```

**Dữ liệu request:**
```json
{
  "user_id": 789
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã chặn người dùng"
}
```

### Bỏ chặn người dùng

```
DELETE /api/messages/block/:user_id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã bỏ chặn người dùng"
}
```

## Mã lỗi

- `400 Bad Request`: Yêu cầu không hợp lệ
- `401 Unauthorized`: Không được xác thực
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `500 Internal Server Error`: Lỗi máy chủ 