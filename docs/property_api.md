# API Quản lý bất động sản (Properties API)

API quản lý bất động sản cung cấp các endpoint để tạo, cập nhật, xóa và quản lý thông tin bất động sản trong ứng dụng.

## Base URL

```
/api/properties
```

> **LƯU Ý:** Hầu hết các endpoint đều yêu cầu xác thực bằng JWT token.

## Endpoints chung

### Lấy danh sách bất động sản

```
GET /api/properties
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số bất động sản trên mỗi trang (mặc định: 20)
- `property_type`: Loại bất động sản (apartment, house, villa, land, office, ...)
- `transaction_type`: Loại giao dịch (sale, rent)
- `city`: Thành phố
- `district`: Quận/Huyện
- `ward`: Phường/Xã
- `price_min`: Giá tối thiểu
- `price_max`: Giá tối đa
- `area_min`: Diện tích tối thiểu
- `area_max`: Diện tích tối đa
- `bedroom_count`: Số phòng ngủ
- `bathroom_count`: Số phòng tắm
- `sort_by`: Sắp xếp theo (price_asc, price_desc, newest, oldest, area_asc, area_desc)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": 123,
        "title": "Căn hộ cao cấp tại The Manor",
        "description": "Căn hộ 2 phòng ngủ, 2 phòng tắm...",
        "property_type": "apartment",
        "transaction_type": "sale",
        "price": 2000000000,
        "area": 85,
        "bedroom_count": 2,
        "bathroom_count": 2,
        "address": "91 Nguyễn Hữu Cảnh",
        "city": "Hồ Chí Minh",
        "district": "Bình Thạnh",
        "ward": "Phường 22",
        "street": "Nguyễn Hữu Cảnh",
        "latitude": 10.7912,
        "longitude": 106.7201,
        "owner_name": "Nguyễn Văn A",
        "contact_phone": "0912345678",
        "contact_email": "example@example.com",
        "images": [
          "https://example.com/images/property123_1.jpg",
          "https://example.com/images/property123_2.jpg"
        ],
        "view_count": 150,
        "favorite_count": 15,
        "created_at": "2023-07-15T08:30:45.000Z",
        "updated_at": "2023-07-20T10:15:30.000Z",
        "status": "active"
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

### Xem chi tiết bất động sản

```
GET /api/properties/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "property": {
      "id": 123,
      "title": "Căn hộ cao cấp tại The Manor",
      "description": "Căn hộ 2 phòng ngủ, 2 phòng tắm...",
      "property_type": "apartment",
      "transaction_type": "sale",
      "price": 2000000000,
      "area": 85,
      "bedroom_count": 2,
      "bathroom_count": 2,
      "address": "91 Nguyễn Hữu Cảnh",
      "city": "Hồ Chí Minh",
      "district": "Bình Thạnh",
      "ward": "Phường 22",
      "street": "Nguyễn Hữu Cảnh",
      "latitude": 10.7912,
      "longitude": 106.7201,
      "owner": {
        "id": 456,
        "fullname": "Nguyễn Văn A",
        "phone": "0912345678",
        "email": "example@example.com",
        "avatar": "https://example.com/avatars/456.jpg"
      },
      "features": [
        "elevator",
        "air_conditioning",
        "parking",
        "swimming_pool",
        "security"
      ],
      "images": [
        {
          "id": 789,
          "url": "https://example.com/images/property123_1.jpg",
          "is_primary": true
        },
        {
          "id": 790,
          "url": "https://example.com/images/property123_2.jpg",
          "is_primary": false
        }
      ],
      "documents": [
        {
          "id": 321,
          "title": "Sổ hồng",
          "url": "https://example.com/documents/property123_1.pdf"
        }
      ],
      "view_count": 150,
      "favorite_count": 15,
      "created_at": "2023-07-15T08:30:45.000Z",
      "updated_at": "2023-07-20T10:15:30.000Z",
      "status": "active",
      "expires_at": "2023-08-15T08:30:45.000Z"
    }
  }
}
```

### Tạo bất động sản mới

```
POST /api/properties
```

**Dữ liệu request:**
```json
{
  "title": "Căn hộ cao cấp tại The Manor",
  "description": "Căn hộ 2 phòng ngủ, 2 phòng tắm...",
  "property_type": "apartment",
  "transaction_type": "sale",
  "price": 2000000000,
  "area": 85,
  "bedroom_count": 2,
  "bathroom_count": 2,
  "address": "91 Nguyễn Hữu Cảnh",
  "city": "Hồ Chí Minh",
  "district": "Bình Thạnh",
  "ward": "Phường 22",
  "street": "Nguyễn Hữu Cảnh",
  "latitude": 10.7912,
  "longitude": 106.7201,
  "features": [
    "elevator",
    "air_conditioning",
    "parking",
    "swimming_pool",
    "security"
  ]
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Tạo mới bất động sản thành công",
  "data": {
    "property_id": 123,
    "status": "pending"
  }
}
```

### Cập nhật bất động sản

```
PUT /api/properties/:id
```

**Dữ liệu request:**
```json
{
  "title": "Căn hộ cao cấp tại The Manor - Đã cập nhật",
  "description": "Căn hộ 2 phòng ngủ, 2 phòng tắm...",
  "price": 2100000000,
  "features": [
    "elevator",
    "air_conditioning",
    "parking",
    "swimming_pool",
    "security",
    "gym"
  ]
}
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Cập nhật bất động sản thành công",
  "data": {
    "property_id": 123
  }
}
```

### Xóa bất động sản

```
DELETE /api/properties/:id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Xóa bất động sản thành công"
}
```

## Endpoints quản lý hình ảnh

### Tải lên hình ảnh bất động sản

```
POST /api/properties/:id/images
```

**Dữ liệu request:**
Form-data với trường `images` chứa các file ảnh (multiple)

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Tải lên hình ảnh thành công",
  "data": {
    "images": [
      {
        "id": 789,
        "url": "https://example.com/images/property123_1.jpg",
        "is_primary": false
      },
      {
        "id": 790,
        "url": "https://example.com/images/property123_2.jpg",
        "is_primary": false
      }
    ]
  }
}
```

### Đặt ảnh đại diện

```
PUT /api/properties/:id/images/:image_id/primary
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đặt ảnh đại diện thành công"
}
```

### Xóa ảnh bất động sản

```
DELETE /api/properties/:id/images/:image_id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Xóa ảnh thành công"
}
```

## Endpoints quản lý tài liệu

### Tải lên tài liệu bất động sản

```
POST /api/properties/:id/documents
```

**Dữ liệu request:**
Form-data với:
- `document`: File tài liệu
- `title`: Tiêu đề tài liệu

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Tải lên tài liệu thành công",
  "data": {
    "document": {
      "id": 321,
      "title": "Sổ hồng",
      "url": "https://example.com/documents/property123_1.pdf",
      "created_at": "2023-07-20T10:15:30.000Z"
    }
  }
}
```

### Xóa tài liệu bất động sản

```
DELETE /api/properties/:id/documents/:document_id
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Xóa tài liệu thành công"
}
```

## Mã lỗi

- `400 Bad Request`: Yêu cầu không hợp lệ
- `401 Unauthorized`: Không được xác thực
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `500 Internal Server Error`: Lỗi máy chủ 