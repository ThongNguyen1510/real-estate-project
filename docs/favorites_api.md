# API Danh sách yêu thích (Favorites API)

API danh sách yêu thích cho phép người dùng quản lý danh sách bất động sản yêu thích của họ trong ứng dụng.

## Lấy danh sách bất động sản yêu thích

```
GET /api/properties/favorites
```

API này trả về danh sách các bất động sản mà người dùng đã đánh dấu là yêu thích.

### Yêu cầu

- *Authentication*: Yêu cầu JWT token

### Tham số query

| Tham số | Kiểu dữ liệu | Mô tả                     | Mặc định |
|---------|--------------|--------------------------|----------|
| page    | integer      | Số trang                 | 1        |
| limit   | integer      | Số lượng kết quả mỗi trang | 10       |

### Phản hồi thành công (200 OK)

```json
{
  "success": true,
  "message": "Lấy danh sách bất động sản yêu thích thành công",
  "data": {
    "properties": [
      {
        "id": 123,
        "title": "Căn hộ cao cấp The Manor",
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
        "owner_name": "Nguyễn Văn A",
        "images": [
          "https://example.com/images/property123_1.jpg",
          "https://example.com/images/property123_2.jpg"
        ],
        "favorite_count": 15,
        "average_rating": 4.5,
        "favorited_at": "2023-08-15T09:30:00.000Z"
      },
      {
        "id": 456,
        "title": "Biệt thự Vinhomes Riverside",
        "description": "Biệt thự 4 phòng ngủ, sân vườn rộng...",
        "property_type": "villa",
        "transaction_type": "sale",
        "price": 15000000000,
        "area": 350,
        "bedroom_count": 4,
        "bathroom_count": 5,
        "address": "Vinhomes Riverside",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Việt Hưng",
        "street": "Hoa Sữa",
        "owner_name": "Trần Văn B",
        "images": [
          "https://example.com/images/property456_1.jpg",
          "https://example.com/images/property456_2.jpg"
        ],
        "favorite_count": 8,
        "average_rating": 4.8,
        "favorited_at": "2023-08-10T14:20:00.000Z"
      }
    ],
    "pagination": {
      "total": 24,
      "totalPages": 3,
      "currentPage": 1,
      "limit": 10
    }
  }
}
```

### Lỗi

- **401 Unauthorized**: Token không hợp lệ hoặc hết hạn
- **500 Internal Server Error**: Lỗi server

## Thêm bất động sản vào danh sách yêu thích

```
POST /api/properties/favorites/{id}
```

API này thêm một bất động sản vào danh sách yêu thích của người dùng.

### Yêu cầu

- *Authentication*: Yêu cầu JWT token
- *Path parameters*: 
  - `id`: ID của bất động sản cần thêm vào danh sách yêu thích

### Phản hồi thành công (201 Created)

```json
{
  "success": true,
  "message": "Đã thêm vào danh sách yêu thích"
}
```

### Lỗi

- **400 Bad Request**: Bất động sản đã có trong danh sách yêu thích
- **401 Unauthorized**: Token không hợp lệ hoặc hết hạn
- **404 Not Found**: Không tìm thấy bất động sản
- **500 Internal Server Error**: Lỗi server

## Xóa bất động sản khỏi danh sách yêu thích

```
DELETE /api/properties/favorites/{id}
```

API này xóa một bất động sản khỏi danh sách yêu thích của người dùng.

### Yêu cầu

- *Authentication*: Yêu cầu JWT token
- *Path parameters*: 
  - `id`: ID của bất động sản cần xóa khỏi danh sách yêu thích

### Phản hồi thành công (200 OK)

```json
{
  "success": true,
  "message": "Đã xóa khỏi danh sách yêu thích"
}
```

### Lỗi

- **401 Unauthorized**: Token không hợp lệ hoặc hết hạn
- **404 Not Found**: Không tìm thấy bất động sản trong danh sách yêu thích
- **500 Internal Server Error**: Lỗi server

## Kiểm tra bất động sản có trong danh sách yêu thích không

```
GET /api/properties/{id}/favorite-status
```

API này kiểm tra xem một bất động sản có nằm trong danh sách yêu thích của người dùng hiện tại hay không.

### Yêu cầu

- *Authentication*: Yêu cầu JWT token
- *Path parameters*: 
  - `id`: ID của bất động sản cần kiểm tra

### Phản hồi thành công (200 OK)

```json
{
  "success": true,
  "data": {
    "is_favorite": true
  }
}
```

### Lỗi

- **401 Unauthorized**: Token không hợp lệ hoặc hết hạn
- **404 Not Found**: Không tìm thấy bất động sản
- **500 Internal Server Error**: Lỗi server 