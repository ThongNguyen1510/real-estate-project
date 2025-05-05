# API Quản lý Cuộc hẹn (Appointment API)

API quản lý cuộc hẹn cung cấp các endpoint để tạo, cập nhật, xóa và quản lý lịch hẹn xem bất động sản giữa người dùng và chủ bất động sản/nhà môi giới.

## Base URL

```
/api/appointments
```

> **LƯU Ý:** Tất cả các endpoint đều yêu cầu xác thực bằng JWT token.

## Endpoints cuộc hẹn

### Lấy danh sách cuộc hẹn

```
GET /api/appointments
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số cuộc hẹn trên mỗi trang (mặc định: 20)
- `status`: Lọc theo trạng thái (pending, confirmed, completed, cancelled)
- `role`: Lọc theo vai trò (requester, owner)
- `from_date`: Lọc từ ngày (định dạng YYYY-MM-DD)
- `to_date`: Lọc đến ngày (định dạng YYYY-MM-DD)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": 123,
        "property_id": 456,
        "property": {
          "title": "Căn hộ cao cấp tại The Manor",
          "address": "91 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. HCM",
          "image": "https://example.com/images/property456_1.jpg"
        },
        "requester_id": 789,
        "requester": {
          "fullname": "Nguyễn Văn A",
          "phone": "0912345678",
          "email": "example@example.com",
          "avatar": "https://example.com/avatars/789.jpg"
        },
        "owner_id": 101,
        "owner": {
          "fullname": "Trần Văn B",
          "phone": "0987654321",
          "email": "owner@example.com",
          "avatar": "https://example.com/avatars/101.jpg"
        },
        "appointment_date": "2023-08-15",
        "appointment_time": "10:30:00",
        "duration": 60,
        "status": "confirmed",
        "notes": "Tôi muốn xem chi tiết về hệ thống điện và nước",
        "created_at": "2023-07-20T10:15:30.000Z",
        "updated_at": "2023-07-21T09:10:25.000Z"
      },
      // ...
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 50,
      "items_per_page": 20
    }
  }
}
```

### Xem chi tiết cuộc hẹn

```
GET /api/appointments/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": 123,
      "property_id": 456,
      "property": {
        "title": "Căn hộ cao cấp tại The Manor",
        "description": "Căn hộ 2 phòng ngủ, 2 phòng tắm...",
        "address": "91 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. HCM",
        "image": "https://example.com/images/property456_1.jpg",
        "price": 2000000000,
        "area": 85,
        "transaction_type": "sale"
      },
      "requester_id": 789,
      "requester": {
        "fullname": "Nguyễn Văn A",
        "phone": "0912345678",
        "email": "example@example.com",
        "avatar": "https://example.com/avatars/789.jpg"
      },
      "owner_id": 101,
      "owner": {
        "fullname": "Trần Văn B",
        "phone": "0987654321",
        "email": "owner@example.com",
        "avatar": "https://example.com/avatars/101.jpg"
      },
      "appointment_date": "2023-08-15",
      "appointment_time": "10:30:00",
      "duration": 60,
      "status": "confirmed",
      "notes": "Tôi muốn xem chi tiết về hệ thống điện và nước",
      "created_at": "2023-07-20T10:15:30.000Z",
      "updated_at": "2023-07-21T09:10:25.000Z",
      "messages": [
        {
          "id": 201,
          "sender_id": 789,
          "sender_name": "Nguyễn Văn A",
          "content": "Tôi có thể đến sớm hơn 15 phút được không?",
          "created_at": "2023-07-21T08:45:20.000Z"
        },
        {
          "id": 202,
          "sender_id": 101,
          "sender_name": "Trần Văn B",
          "content": "Được, không vấn đề gì.",
          "created_at": "2023-07-21T09:10:25.000Z"
        }
      ]
    }
  }
}
```

### Tạo cuộc hẹn mới

```
POST /api/appointments
```

**Dữ liệu request:**
```json
{
  "property_id": 456,
  "appointment_date": "2023-08-15",
  "appointment_time": "10:30:00",
  "duration": 60,
  "notes": "Tôi muốn xem chi tiết về hệ thống điện và nước"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã đặt lịch hẹn thành công",
  "data": {
    "appointment_id": 123,
    "status": "pending"
  }
}
```

### Cập nhật cuộc hẹn

```
PUT /api/appointments/:id
```

**Dữ liệu request:**
```json
{
  "appointment_date": "2023-08-16",
  "appointment_time": "14:00:00",
  "duration": 45,
  "notes": "Tôi muốn xem chi tiết về hệ thống điện, nước và an ninh"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã cập nhật lịch hẹn thành công"
}
```

### Xác nhận cuộc hẹn

```
PUT /api/appointments/:id/confirm
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã xác nhận lịch hẹn thành công"
}
```

### Hoàn thành cuộc hẹn

```
PUT /api/appointments/:id/complete
```

**Dữ liệu request:**
```json
{
  "feedback": "Cuộc hẹn diễn ra tốt đẹp",
  "rating": 4.5
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã đánh dấu cuộc hẹn hoàn thành"
}
```

### Hủy cuộc hẹn

```
PUT /api/appointments/:id/cancel
```

**Dữ liệu request:**
```json
{
  "reason": "Có việc đột xuất không thể tham dự"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã hủy lịch hẹn thành công"
}
```

## Endpoints thông báo cuộc hẹn

### Gửi nhắc nhở cuộc hẹn

```
POST /api/appointments/:id/reminders
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã gửi nhắc nhở thành công"
}
```

### Gửi tin nhắn về cuộc hẹn

```
POST /api/appointments/:id/messages
```

**Dữ liệu request:**
```json
{
  "content": "Tôi có thể đến sớm hơn 15 phút được không?"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã gửi tin nhắn thành công",
  "data": {
    "message": {
      "id": 201,
      "sender_id": 789,
      "sender_name": "Nguyễn Văn A",
      "content": "Tôi có thể đến sớm hơn 15 phút được không?",
      "created_at": "2023-07-21T08:45:20.000Z"
    }
  }
}
```

## Endpoints thống kê cuộc hẹn

### Lấy thống kê cuộc hẹn

```
GET /api/appointments/statistics
```

**Tham số query:**
- `period`: Khoảng thời gian (week, month, year - mặc định: month)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total": 45,
      "pending": 10,
      "confirmed": 15,
      "completed": 15,
      "cancelled": 5,
      "by_period": [
        {
          "period": "2023-07-01",
          "count": 12
        },
        {
          "period": "2023-07-08",
          "count": 15
        },
        {
          "period": "2023-07-15",
          "count": 10
        },
        {
          "period": "2023-07-22",
          "count": 8
        }
      ]
    }
  }
}
```

## Mã lỗi

- `400 Bad Request`: Yêu cầu không hợp lệ
- `401 Unauthorized`: Không được xác thực
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `409 Conflict`: Xung đột lịch hẹn
- `500 Internal Server Error`: Lỗi máy chủ 