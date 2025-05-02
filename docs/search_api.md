# API Tìm kiếm (Search API)

API tìm kiếm cung cấp các endpoint để tìm kiếm bất động sản và các thông tin liên quan trong ứng dụng.

## Base URL

```
/api/search
```

## Endpoints tìm kiếm bất động sản

### Tìm kiếm bất động sản

```
GET /api/search/properties
```

**Tham số query:**
- `keyword`: Từ khóa tìm kiếm
- `page`: Số trang (mặc định: 1)
- `limit`: Số kết quả trên mỗi trang (mặc định: 20)
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
- `features`: Tiện ích (phân tách bằng dấu phẩy, ví dụ: elevator,parking,swimming_pool)
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
        "images": [
          "https://example.com/images/property123_1.jpg"
        ],
        "view_count": 150,
        "favorite_count": 15,
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

### Tìm kiếm nâng cao

```
POST /api/search/advanced
```

**Dữ liệu request:**
```json
{
  "keyword": "căn hộ cao cấp",
  "filters": {
    "property_type": ["apartment", "penthouse"],
    "transaction_type": "sale",
    "price_range": {
      "min": 1000000000,
      "max": 5000000000
    },
    "area_range": {
      "min": 70,
      "max": 150
    },
    "bedroom_count": [2, 3],
    "bathroom_count": [2, 3],
    "location": {
      "city": "Hồ Chí Minh",
      "districts": ["Bình Thạnh", "Quận 2", "Quận 7"]
    },
    "features": ["elevator", "swimming_pool", "security", "parking"]
  },
  "sort": {
    "field": "price",
    "order": "desc"
  },
  "page": 1,
  "limit": 20
}
```

**Phản hồi thành công:** Tương tự với endpoint tìm kiếm bình thường.

### Đề xuất bất động sản phù hợp

```
GET /api/search/recommendations
```

**Tham số query:**
- `property_id`: ID của bất động sản tham chiếu (tùy chọn)
- `page`: Số trang (mặc định: 1)
- `limit`: Số kết quả trên mỗi trang (mặc định: 10)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": 124,
        "title": "Căn hộ cao cấp tại Landmark 81",
        "description": "Căn hộ 2 phòng ngủ, 2 phòng tắm...",
        "property_type": "apartment",
        "transaction_type": "sale",
        "price": 2500000000,
        "area": 90,
        "images": [
          "https://example.com/images/property124_1.jpg"
        ],
        "similarity_score": 0.92
      },
      // ...
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 12,
      "items_per_page": 10
    }
  }
}
```

## Endpoints gợi ý tìm kiếm

### Gợi ý từ khóa tìm kiếm

```
GET /api/search/suggestions
```

**Tham số query:**
- `keyword`: Phần đầu của từ khóa tìm kiếm
- `limit`: Số lượng gợi ý (mặc định: 10)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "căn hộ cao cấp quận 7",
      "căn hộ cao cấp bình thạnh",
      "căn hộ cao cấp landmark 81",
      "căn hộ cao cấp the manor",
      "căn hộ cao cấp vinhomes central park"
    ]
  }
}
```

### Gợi ý vị trí

```
GET /api/search/location-suggestions
```

**Tham số query:**
- `keyword`: Phần đầu của tên vị trí
- `limit`: Số lượng gợi ý (mặc định: 10)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "id": 1,
        "name": "Bình Thạnh",
        "type": "district",
        "city": "Hồ Chí Minh",
        "property_count": 150
      },
      {
        "id": 2,
        "name": "Bình Tân",
        "type": "district",
        "city": "Hồ Chí Minh",
        "property_count": 120
      },
      {
        "id": 3,
        "name": "Bình Chánh",
        "type": "district",
        "city": "Hồ Chí Minh",
        "property_count": 80
      }
    ]
  }
}
```

## Endpoints thống kê tìm kiếm

### Lấy từ khóa phổ biến

```
GET /api/search/trending-keywords
```

**Tham số query:**
- `limit`: Số lượng từ khóa (mặc định: 10)
- `period`: Khoảng thời gian (day, week, month - mặc định: week)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "keywords": [
      {
        "keyword": "căn hộ quận 7",
        "search_count": 250
      },
      {
        "keyword": "nhà phố thủ đức",
        "search_count": 180
      },
      {
        "keyword": "chung cư vinhomes",
        "search_count": 150
      },
      {
        "keyword": "đất nền long thành",
        "search_count": 120
      },
      {
        "keyword": "căn hộ 2 phòng ngủ",
        "search_count": 100
      }
    ]
  }
}
```

### Lấy thống kê tìm kiếm cá nhân

```
GET /api/search/history
```

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số kết quả trên mỗi trang (mặc định: 20)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "searches": [
      {
        "id": 123,
        "keyword": "căn hộ quận 7",
        "filters": {
          "property_type": "apartment",
          "price_min": 1000000000,
          "price_max": 3000000000
        },
        "result_count": 45,
        "created_at": "2023-07-15T08:30:45.000Z"
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

### Xóa lịch sử tìm kiếm

```
DELETE /api/search/history
```

**Tham số query:**
- `id`: ID của lượt tìm kiếm cần xóa (không bắt buộc, nếu không có sẽ xóa tất cả)

**Phản hồi thành công:**
```json
{
  "success": true,
  "message": "Đã xóa lịch sử tìm kiếm"
}
```

## Mã lỗi

- `400 Bad Request`: Yêu cầu không hợp lệ
- `401 Unauthorized`: Không được xác thực
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `500 Internal Server Error`: Lỗi máy chủ 