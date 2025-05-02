# API Quản trị (Admin API)

API quản trị cung cấp các endpoint để quản lý và điều hành ứng dụng bất động sản. Các chức năng này chỉ dành cho người dùng có quyền admin.

## Base URL

```
/api/admin
```

> **LƯU Ý:** Tất cả các endpoint đều yêu cầu xác thực bằng JWT token có quyền admin.

## Endpoints quản lý người dùng

### Lấy danh sách người dùng

```
GET /api/admin/users
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số người dùng trên mỗi trang (mặc định: 20)
- `role`: Lọc theo vai trò (user, agent, admin)
- `status`: Lọc theo trạng thái (active, inactive, banned)
- `search`: Tìm kiếm theo tên, email hoặc số điện thoại
- `sort_by`: Sắp xếp theo (created_at_asc, created_at_desc, name_asc, name_desc)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 123,
        "fullname": "Nguyễn Văn A",
        "email": "example@example.com",
        "phone": "0912345678",
        "role": "user",
        "status": "active",
        "property_count": 5,
        "created_at": "2023-07-15T08:30:45.000Z",
        "last_login": "2023-07-20T10:15:30.000Z"
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

### Xem chi tiết người dùng

```
GET /api/admin/users/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "fullname": "Nguyễn Văn A",
      "email": "example@example.com",
      "phone": "0912345678",
      "address": "123 Đường ABC, Quận XYZ, Thành phố HCM",
      "avatar": "https://example.com/avatars/123.jpg",
      "bio": "Nhà môi giới bất động sản với hơn 5 năm kinh nghiệm",
      "role": "user",
      "status": "active",
      "property_count": 5,
      "created_at": "2023-07-15T08:30:45.000Z",
      "updated_at": "2023-07-20T10:15:30.000Z",
      "last_login": "2023-07-20T10:15:30.000Z",
      "properties": [
        {
          "id": 456,
          "title": "Căn hộ cao cấp tại trung tâm",
          "status": "active",
          "created_at": "2023-06-10T08:30:45.000Z"
        },
        // ...
      ],
      "activity_log": [
        {
          "action": "login",
          "ip_address": "192.168.1.1",
          "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
          "timestamp": "2023-07-20T10:15:30.000Z"
        },
        // ...
      ]
    }
  }
}
```

### Cập nhật thông tin người dùng

```
PUT /api/admin/users/:id
```

**Dữ liệu request:**
```json
{
  "fullname": "Nguyễn Văn A",
  "email": "new_email@example.com",
  "phone": "0912345678",
  "role": "agent",
  "status": "active"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Cập nhật thông tin người dùng thành công"
}
```

### Khóa/mở khóa người dùng

```
PUT /api/admin/users/:id/status
```

**Dữ liệu request:**
```json
{
  "status": "banned",
  "reason": "Vi phạm điều khoản sử dụng"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã cập nhật trạng thái người dùng"
}
```

### Xóa người dùng

```
DELETE /api/admin/users/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã xóa người dùng thành công"
}
```

## Endpoints quản lý bất động sản

### Lấy danh sách bất động sản

```
GET /api/admin/properties
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số bất động sản trên mỗi trang (mặc định: 20)
- `status`: Lọc theo trạng thái (active, pending, expired, rejected)
- `property_type`: Loại bất động sản (apartment, house, villa, land, office, ...)
- `transaction_type`: Loại giao dịch (sale, rent)
- `user_id`: ID của người dùng (không bắt buộc)
- `search`: Tìm kiếm theo tiêu đề hoặc địa chỉ
- `sort_by`: Sắp xếp theo (created_at_asc, created_at_desc, price_asc, price_desc)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": 456,
        "title": "Căn hộ cao cấp tại trung tâm",
        "property_type": "apartment",
        "transaction_type": "sale",
        "price": 2500000000,
        "area": 85,
        "address": "91 Nguyễn Hữu Cảnh, Bình Thạnh, TP. HCM",
        "owner": {
          "id": 123,
          "fullname": "Nguyễn Văn A"
        },
        "status": "active",
        "created_at": "2023-06-10T08:30:45.000Z",
        "expires_at": "2023-07-10T08:30:45.000Z"
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

### Xem chi tiết bất động sản (admin)

```
GET /api/admin/properties/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "property": {
      "id": 456,
      "title": "Căn hộ cao cấp tại trung tâm",
      "description": "Căn hộ 2 phòng ngủ, view đẹp...",
      "property_type": "apartment",
      "transaction_type": "sale",
      "price": 2500000000,
      "area": 85,
      "bedroom_count": 2,
      "bathroom_count": 2,
      "address": "91 Nguyễn Hữu Cảnh",
      "city": "Hồ Chí Minh",
      "district": "Bình Thạnh",
      "ward": "Phường 22",
      "street": "Nguyễn Hữu Cảnh",
      "owner": {
        "id": 123,
        "fullname": "Nguyễn Văn A",
        "email": "example@example.com",
        "phone": "0912345678"
      },
      "status": "active",
      "created_at": "2023-06-10T08:30:45.000Z",
      "updated_at": "2023-06-15T10:20:30.000Z",
      "expires_at": "2023-07-10T08:30:45.000Z",
      "views": 125,
      "favorite_count": 15,
      "reports": [
        {
          "id": 789,
          "reason": "Sai thông tin",
          "description": "Địa chỉ không chính xác",
          "reporter": {
            "id": 234,
            "fullname": "Trần Văn B"
          },
          "created_at": "2023-06-20T09:45:15.000Z"
        },
        // ...
      ],
      "moderation_history": [
        {
          "action": "approved",
          "admin_id": 345,
          "admin_name": "Admin",
          "comment": "Đã xác minh thông tin",
          "timestamp": "2023-06-11T08:30:45.000Z"
        },
        // ...
      ]
    }
  }
}
```

### Duyệt/từ chối bất động sản

```
PUT /api/admin/properties/:id/moderate
```

**Dữ liệu request:**
```json
{
  "action": "approve",
  "comment": "Đã xác minh thông tin, bất động sản hợp lệ"
}
```

hoặc

```json
{
  "action": "reject",
  "comment": "Thông tin không chính xác, cần bổ sung hình ảnh"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã duyệt bất động sản thành công"
}
```

hoặc

```json
{
  "success": true,
  "message": "Đã từ chối bất động sản"
}
```

### Gỡ bỏ bất động sản

```
PUT /api/admin/properties/:id/takedown
```

**Dữ liệu request:**
```json
{
  "reason": "Vi phạm điều khoản sử dụng",
  "notify_owner": true
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã gỡ bỏ bất động sản thành công"
}
```

## Endpoints báo cáo và thống kê

### Lấy báo cáo tổng quan

```
GET /api/admin/dashboard
```

**Tham số query:**
- `period`: Khoảng thời gian (day, week, month, year - mặc định: month)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "new": 45,
      "active": 800,
      "growth": 3.5
    },
    "properties": {
      "total": 5678,
      "new": 120,
      "pending": 35,
      "active": 4500,
      "expired": 1023,
      "rejected": 120
    },
    "transactions": {
      "views": 25000,
      "favorites": 3500,
      "appointments": 450
    },
    "charts": {
      "user_growth": [
        {
          "date": "2023-06-01",
          "value": 12
        },
        // ...
      ],
      "property_listings": [
        {
          "date": "2023-06-01",
          "value": 30
        },
        // ...
      ],
      "user_activity": {
        "labels": ["Xem", "Yêu thích", "Hẹn xem", "Liên hệ"],
        "values": [25000, 3500, 450, 2800]
      }
    }
  }
}
```

### Lấy danh sách báo cáo tin đăng

```
GET /api/admin/reports
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số báo cáo trên mỗi trang (mặc định: 20)
- `status`: Lọc theo trạng thái (pending, processed, ignored)
- `property_id`: ID của bất động sản (không bắt buộc)
- `sort_by`: Sắp xếp theo (created_at_asc, created_at_desc)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 789,
        "property_id": 456,
        "property_title": "Căn hộ cao cấp tại trung tâm",
        "reason": "Sai thông tin",
        "description": "Địa chỉ không chính xác",
        "reporter": {
          "id": 234,
          "fullname": "Trần Văn B"
        },
        "status": "pending",
        "created_at": "2023-06-20T09:45:15.000Z"
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

### Xử lý báo cáo

```
PUT /api/admin/reports/:id
```

**Dữ liệu request:**
```json
{
  "status": "processed",
  "comment": "Đã yêu cầu chủ bất động sản sửa thông tin",
  "action_taken": "warning"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã xử lý báo cáo thành công"
}
```

## Endpoints cài đặt hệ thống

### Lấy cài đặt hệ thống

```
GET /api/admin/settings
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "website_name": "BatDongSan.VN",
      "logo_url": "https://example.com/logo.png",
      "contact_email": "contact@batdongsan.vn",
      "contact_phone": "1900 1234",
      "property_expiry_days": 30,
      "property_approval_required": true,
      "max_images_per_property": 20,
      "max_featured_properties": 10,
      "maintenance_mode": false,
      "version": "1.2.3"
    }
  }
}
```

### Cập nhật cài đặt hệ thống

```
PUT /api/admin/settings
```

**Dữ liệu request:**
```json
{
  "website_name": "BatDongSan.VN",
  "contact_email": "support@batdongsan.vn",
  "property_expiry_days": 45,
  "property_approval_required": true,
  "maintenance_mode": false
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã cập nhật cài đặt hệ thống thành công"
}
```

## Mã lỗi

- `400 Bad Request`: Yêu cầu không hợp lệ
- `401 Unauthorized`: Không được xác thực
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `500 Internal Server Error`: Lỗi máy chủ 