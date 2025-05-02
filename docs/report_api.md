# API Báo cáo tin đăng (Report API)

API báo cáo tin đăng cung cấp các endpoint để người dùng báo cáo các bất động sản có thông tin không chính xác, lừa đảo hoặc vi phạm quy định của ứng dụng.

## Base URL

```
/api/reports
```

> **LƯU Ý:** Một số endpoint yêu cầu xác thực bằng JWT token.

## Endpoints báo cáo

### Gửi báo cáo tin đăng

```
POST /api/properties/:id/report
```

**Dữ liệu request:**
```json
{
  "reason": "fake_information",
  "description": "Địa chỉ thực tế không trùng với địa chỉ được đăng. Tôi đã đến tận nơi kiểm tra.",
  "contact_information": "0912345678"
}
```

**Danh sách lý do báo cáo (reason):**
- `fake_information`: Thông tin giả mạo/sai sự thật
- `fraudulent_listing`: Lừa đảo
- `duplicate_listing`: Bài đăng trùng lặp
- `offensive_content`: Nội dung xúc phạm
- `wrong_category`: Sai danh mục
- `expired_listing`: Bài đăng đã hết hạn
- `unauthorized_use`: Sử dụng trái phép hình ảnh hoặc thông tin
- `other`: Lý do khác

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Báo cáo của bạn đã được gửi thành công",
  "data": {
    "report_id": 123
  }
}
```

### Xem danh sách báo cáo đã gửi

```
GET /api/reports/my-reports
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số báo cáo trên mỗi trang (mặc định: 20)
- `status`: Lọc theo trạng thái (pending, processed, ignored)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 123,
        "property": {
          "id": 456,
          "title": "Căn hộ cao cấp tại trung tâm",
          "address": "91 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. HCM",
          "image": "https://example.com/images/property456_1.jpg"
        },
        "reason": "fake_information",
        "description": "Địa chỉ thực tế không trùng với địa chỉ được đăng. Tôi đã đến tận nơi kiểm tra.",
        "status": "pending",
        "created_at": "2023-07-15T08:30:45.000Z",
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

### Hủy báo cáo

```
DELETE /api/reports/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã hủy báo cáo thành công"
}
```

## Endpoints quản lý báo cáo (Admin)

### Lấy danh sách báo cáo

```
GET /api/admin/reports
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số báo cáo trên mỗi trang (mặc định: 20)
- `status`: Lọc theo trạng thái (pending, processed, ignored)
- `reason`: Lọc theo lý do báo cáo
- `property_id`: Lọc theo ID bất động sản
- `reporter_id`: Lọc theo ID người báo cáo
- `from_date`: Lọc từ ngày (định dạng YYYY-MM-DD)
- `to_date`: Lọc đến ngày (định dạng YYYY-MM-DD)
- `sort_by`: Sắp xếp theo (created_at_asc, created_at_desc)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 123,
        "property": {
          "id": 456,
          "title": "Căn hộ cao cấp tại trung tâm",
          "address": "91 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. HCM",
          "image": "https://example.com/images/property456_1.jpg",
          "owner_id": 789,
          "owner_name": "Nguyễn Văn A"
        },
        "reporter": {
          "id": 101,
          "fullname": "Trần Văn B",
          "email": "example@example.com",
          "phone": "0912345678"
        },
        "reason": "fake_information",
        "description": "Địa chỉ thực tế không trùng với địa chỉ được đăng. Tôi đã đến tận nơi kiểm tra.",
        "contact_information": "0912345678",
        "status": "pending",
        "admin_note": "",
        "created_at": "2023-07-15T08:30:45.000Z",
        "updated_at": "2023-07-15T08:30:45.000Z"
      },
      // ...
    ],
    "statistics": {
      "total": 45,
      "pending": 20,
      "processed": 15,
      "ignored": 10
    },
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 45,
      "items_per_page": 20
    }
  }
}
```

### Xem chi tiết báo cáo

```
GET /api/admin/reports/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "report": {
      "id": 123,
      "property": {
        "id": 456,
        "title": "Căn hộ cao cấp tại trung tâm",
        "description": "Căn hộ 2 phòng ngủ, view đẹp...",
        "address": "91 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. HCM",
        "images": [
          "https://example.com/images/property456_1.jpg",
          "https://example.com/images/property456_2.jpg"
        ],
        "owner": {
          "id": 789,
          "fullname": "Nguyễn Văn A",
          "email": "owner@example.com",
          "phone": "0987654321"
        },
        "created_at": "2023-06-10T08:30:45.000Z",
        "status": "active"
      },
      "reporter": {
        "id": 101,
        "fullname": "Trần Văn B",
        "email": "example@example.com",
        "phone": "0912345678",
        "reports_count": 3
      },
      "reason": "fake_information",
      "description": "Địa chỉ thực tế không trùng với địa chỉ được đăng. Tôi đã đến tận nơi kiểm tra.",
      "contact_information": "0912345678",
      "status": "pending",
      "admin_note": "",
      "created_at": "2023-07-15T08:30:45.000Z",
      "updated_at": "2023-07-15T08:30:45.000Z",
      "similar_reports": [
        {
          "id": 124,
          "reason": "fake_information",
          "reporter_name": "Lê Văn C",
          "created_at": "2023-07-14T10:15:30.000Z",
          "status": "pending"
        }
      ]
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
  "admin_note": "Đã kiểm tra và yêu cầu chủ bất động sản cập nhật thông tin địa chỉ chính xác",
  "action": "warning",
  "notify_reporter": true,
  "notify_owner": true
}
```

**Các giá trị cho trường action:**
- `warning`: Cảnh báo chủ bất động sản
- `suspend_listing`: Tạm ngưng tin đăng
- `delete_listing`: Xóa tin đăng
- `suspend_user`: Tạm khóa tài khoản người dùng
- `no_action`: Không có hành động

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã xử lý báo cáo thành công"
}
```

### Bỏ qua báo cáo

```
PUT /api/admin/reports/:id/ignore
```

**Dữ liệu request:**
```json
{
  "admin_note": "Thông tin bất động sản đã được kiểm tra và xác nhận là chính xác",
  "notify_reporter": true
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã bỏ qua báo cáo"
}
```

### Xóa báo cáo

```
DELETE /api/admin/reports/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã xóa báo cáo thành công"
}
```

## Endpoints thống kê báo cáo (Admin)

### Lấy thống kê báo cáo

```
GET /api/admin/reports/statistics
```

**Tham số query:**
- `period`: Khoảng thời gian (week, month, year - mặc định: month)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total": 145,
      "by_status": {
        "pending": 45,
        "processed": 80,
        "ignored": 20
      },
      "by_reason": {
        "fake_information": 60,
        "fraudulent_listing": 30,
        "duplicate_listing": 25,
        "offensive_content": 10,
        "wrong_category": 8,
        "expired_listing": 5,
        "unauthorized_use": 5,
        "other": 2
      },
      "by_period": [
        {
          "period": "2023-06-01",
          "count": 35
        },
        {
          "period": "2023-07-01",
          "count": 45
        },
        {
          "period": "2023-08-01",
          "count": 65
        }
      ],
      "popular_properties": [
        {
          "property_id": 456,
          "property_title": "Căn hộ cao cấp tại trung tâm",
          "reports_count": 5
        },
        // ...
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
- `500 Internal Server Error`: Lỗi máy chủ 