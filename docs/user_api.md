# API Quản lý người dùng (User API)

API quản lý người dùng cung cấp các endpoint để đăng ký, đăng nhập, quản lý hồ sơ người dùng và thực hiện các chức năng liên quan đến tài khoản.

## Base URL

```
/api/auth và /api/users
```

## Endpoints xác thực

### Đăng ký tài khoản

```
POST /api/auth/register
```

**Dữ liệu request:**
```json
{
  "fullname": "Nguyễn Văn A",
  "email": "example@example.com",
  "password": "password123",
  "phone": "0912345678",
  "role": "user"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "user": {
      "id": 123,
      "fullname": "Nguyễn Văn A",
      "email": "example@example.com",
      "phone": "0912345678",
      "role": "user",
      "created_at": "2023-07-15T08:30:45.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### Đăng nhập

```
POST /api/auth/login
```

**Dữ liệu request:**
```json
{
  "email": "example@example.com",
  "password": "password123"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": 123,
      "fullname": "Nguyễn Văn A",
      "email": "example@example.com",
      "phone": "0912345678",
      "role": "user",
      "created_at": "2023-07-15T08:30:45.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### Quên mật khẩu

```
POST /api/auth/forgot-password
```

**Dữ liệu request:**
```json
{
  "email": "example@example.com"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Email khôi phục mật khẩu đã được gửi"
}
```

### Đặt lại mật khẩu

```
POST /api/auth/reset-password
```

**Dữ liệu request:**
```json
{
  "token": "reset_token_here",
  "password": "new_password123"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công"
}
```

## Endpoints quản lý hồ sơ

### Lấy thông tin hồ sơ người dùng

```
GET /api/users/profile
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
      "created_at": "2023-07-15T08:30:45.000Z",
      "updated_at": "2023-07-20T10:15:30.000Z"
    }
  }
}
```

### Cập nhật hồ sơ người dùng

```
PUT /api/users/profile
```

**Dữ liệu request:**
```json
{
  "fullname": "Nguyễn Văn A",
  "phone": "0912345678",
  "address": "123 Đường ABC, Quận XYZ, Thành phố HCM",
  "bio": "Nhà môi giới bất động sản với hơn 5 năm kinh nghiệm"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Cập nhật hồ sơ thành công",
  "data": {
    "user": {
      "id": 123,
      "fullname": "Nguyễn Văn A",
      "email": "example@example.com",
      "phone": "0912345678",
      "address": "123 Đường ABC, Quận XYZ, Thành phố HCM",
      "avatar": "https://example.com/avatars/123.jpg",
      "bio": "Nhà môi giới bất động sản với hơn 5 năm kinh nghiệm",
      "updated_at": "2023-07-20T10:15:30.000Z"
    }
  }
}
```

### Thay đổi mật khẩu

```
PUT /api/users/change-password
```

**Dữ liệu request:**
```json
{
  "current_password": "old_password123",
  "new_password": "new_password123"
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Thay đổi mật khẩu thành công"
}
```

### Tải lên ảnh đại diện

```
POST /api/users/avatar
```

**Dữ liệu request:**
Form-data với trường `avatar` chứa file ảnh

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Tải lên ảnh đại diện thành công",
  "data": {
    "avatar_url": "https://example.com/avatars/123.jpg"
  }
}
```

## Endpoints quản lý bất động sản của người dùng

### Lấy danh sách bất động sản đã đăng

```
GET /api/users/properties
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số bất động sản trên mỗi trang (mặc định: 10)
- `status`: Lọc theo trạng thái (active, pending, expired, rejected)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": 456,
        "title": "Căn hộ cao cấp tại trung tâm",
        "description": "Căn hộ 2 phòng ngủ, view đẹp...",
        "price": 2500000000,
        "area": 85,
        "status": "active",
        "created_at": "2023-06-10T08:30:45.000Z",
        "expires_at": "2023-07-10T08:30:45.000Z",
        "views": 125,
        "favorite_count": 15,
        "images": [
          "https://example.com/images/property456_1.jpg"
        ]
      },
      // ...
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10
    }
  }
}
```

## Mã lỗi

- `400 Bad Request`: Yêu cầu không hợp lệ
- `401 Unauthorized`: Không được xác thực
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `409 Conflict`: Email đã được sử dụng (khi đăng ký)
- `500 Internal Server Error`: Lỗi máy chủ 