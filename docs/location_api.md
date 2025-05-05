# API Quản lý vị trí (Location API)

API quản lý vị trí cung cấp các endpoint để truy xuất và quản lý thông tin về các vị trí địa lý như thành phố, quận/huyện, phường/xã và các khu vực liên quan trong ứng dụng bất động sản.

## Base URL

```
/api/locations
```

## Endpoints quản lý vị trí

### Lấy danh sách thành phố

```
GET /api/locations/cities
```

**Tham số query:**
- `country`: Mã quốc gia (mặc định: VN)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "cities": [
      {
        "id": 1,
        "name": "Hồ Chí Minh",
        "code": "SG",
        "property_count": 1250
      },
      {
        "id": 2,
        "name": "Hà Nội",
        "code": "HN",
        "property_count": 980
      },
      {
        "id": 3,
        "name": "Đà Nẵng",
        "code": "DN",
        "property_count": 450
      },
      // ...
    ]
  }
}
```

### Lấy danh sách quận/huyện theo thành phố

```
GET /api/locations/districts
```

**Tham số query:**
- `city_id`: ID của thành phố

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "districts": [
      {
        "id": 1,
        "name": "Quận 1",
        "code": "D1",
        "city_id": 1,
        "city_name": "Hồ Chí Minh",
        "property_count": 320
      },
      {
        "id": 2,
        "name": "Quận 2",
        "code": "D2",
        "city_id": 1,
        "city_name": "Hồ Chí Minh",
        "property_count": 280
      },
      {
        "id": 3,
        "name": "Quận 3",
        "code": "D3",
        "city_id": 1,
        "city_name": "Hồ Chí Minh",
        "property_count": 210
      },
      // ...
    ]
  }
}
```

### Lấy danh sách phường/xã theo quận/huyện

```
GET /api/locations/wards
```

**Tham số query:**
- `district_id`: ID của quận/huyện

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "wards": [
      {
        "id": 1,
        "name": "Phường Bến Nghé",
        "code": "BN",
        "district_id": 1,
        "district_name": "Quận 1",
        "city_id": 1,
        "city_name": "Hồ Chí Minh",
        "property_count": 45
      },
      {
        "id": 2,
        "name": "Phường Bến Thành",
        "code": "BT",
        "district_id": 1,
        "district_name": "Quận 1",
        "city_id": 1,
        "city_name": "Hồ Chí Minh",
        "property_count": 60
      },
      // ...
    ]
  }
}
```

### Lấy danh sách đường phố theo phường/xã

```
GET /api/locations/streets
```

**Tham số query:**
- `ward_id`: ID của phường/xã (tùy chọn)
- `district_id`: ID của quận/huyện (tùy chọn, sử dụng nếu không có ward_id)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "streets": [
      {
        "id": 1,
        "name": "Đường Nguyễn Huệ",
        "ward_id": 1,
        "ward_name": "Phường Bến Nghé",
        "district_id": 1,
        "district_name": "Quận 1",
        "city_id": 1,
        "city_name": "Hồ Chí Minh",
        "property_count": 15
      },
      {
        "id": 2,
        "name": "Đường Lê Lợi",
        "ward_id": 2,
        "ward_name": "Phường Bến Thành",
        "district_id": 1,
        "district_name": "Quận 1",
        "city_id": 1,
        "city_name": "Hồ Chí Minh",
        "property_count": 25
      },
      // ...
    ]
  }
}
```

### Tìm kiếm vị trí

```
GET /api/locations/search
```

**Tham số query:**
- `keyword`: Từ khóa tìm kiếm
- `type`: Loại vị trí (city, district, ward, street - không bắt buộc)
- `limit`: Số lượng kết quả (mặc định: 20)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "id": 1,
        "name": "Quận 1",
        "type": "district",
        "parent_name": "Hồ Chí Minh",
        "property_count": 320
      },
      {
        "id": 10,
        "name": "Quận 10",
        "type": "district",
        "parent_name": "Hồ Chí Minh",
        "property_count": 180
      },
      {
        "id": 11,
        "name": "Quận 11",
        "type": "district",
        "parent_name": "Hồ Chí Minh",
        "property_count": 150
      },
      // ...
    ]
  }
}
```

## Endpoints thống kê vị trí

### Lấy thống kê bất động sản theo thành phố

```
GET /api/locations/statistics/cities
```

**Tham số query:**
- `limit`: Số lượng thành phố (mặc định: 10)
- `sort_by`: Sắp xếp theo (property_count, price_avg - mặc định: property_count)
- `transaction_type`: Loại giao dịch (sale, rent - không bắt buộc)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "statistics": [
      {
        "id": 1,
        "name": "Hồ Chí Minh",
        "property_count": 1250,
        "price_avg": 25000000,
        "price_min": 1000000000,
        "price_max": 50000000000
      },
      {
        "id": 2,
        "name": "Hà Nội",
        "property_count": 980,
        "price_avg": 22000000,
        "price_min": 800000000,
        "price_max": 40000000000
      },
      // ...
    ]
  }
}
```

### Lấy thống kê bất động sản theo quận/huyện

```
GET /api/locations/statistics/districts
```

**Tham số query:**
- `city_id`: ID của thành phố
- `limit`: Số lượng quận/huyện (mặc định: 10)
- `sort_by`: Sắp xếp theo (property_count, price_avg - mặc định: property_count)
- `transaction_type`: Loại giao dịch (sale, rent - không bắt buộc)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "statistics": [
      {
        "id": 1,
        "name": "Quận 1",
        "property_count": 320,
        "price_avg": 40000000,
        "price_min": 2000000000,
        "price_max": 50000000000
      },
      {
        "id": 7,
        "name": "Quận 7",
        "property_count": 280,
        "price_avg": 35000000,
        "price_min": 1800000000,
        "price_max": 45000000000
      },
      // ...
    ]
  }
}
```

## Endpoints quản lý khu vực nổi bật

### Lấy danh sách khu vực nổi bật

```
GET /api/locations/featured
```

**Tham số query:**
- `type`: Loại vị trí (city, district - mặc định: district)
- `limit`: Số lượng kết quả (mặc định: 10)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "featured_locations": [
      {
        "id": 1,
        "name": "Quận 1",
        "type": "district",
        "parent_name": "Hồ Chí Minh",
        "property_count": 320,
        "image": "https://example.com/images/locations/district1.jpg",
        "description": "Trung tâm thương mại sầm uất với nhiều cao ốc văn phòng",
        "is_featured": true
      },
      {
        "id": 7,
        "name": "Quận 7",
        "type": "district",
        "parent_name": "Hồ Chí Minh",
        "property_count": 280,
        "image": "https://example.com/images/locations/district7.jpg",
        "description": "Khu đô thị mới với nhiều tiện ích hiện đại",
        "is_featured": true
      },
      // ...
    ]
  }
}
```

## Endpoints địa điểm lân cận

### Lấy danh sách địa điểm lân cận theo bất động sản

```
GET /api/locations/nearby
```

**Tham số query:**
- `property_id`: ID của bất động sản
- `types`: Loại địa điểm (phân tách bằng dấu phẩy, ví dụ: school,hospital,shopping_mall)
- `radius`: Bán kính tìm kiếm tính bằng km (mặc định: 2)
- `limit`: Số lượng kết quả cho mỗi loại (mặc định: 5)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "nearby_places": {
      "schools": [
        {
          "id": 1,
          "name": "Trường THPT Lê Quý Đôn",
          "address": "110 Nguyễn Huệ, Quận 1, TP. HCM",
          "distance": 0.5,
          "lat": 10.7725,
          "lng": 106.7031
        },
        // ...
      ],
      "hospitals": [
        {
          "id": 2,
          "name": "Bệnh viện Việt Đức",
          "address": "215 Hồng Bàng, Quận 5, TP. HCM",
          "distance": 1.2,
          "lat": 10.7589,
          "lng": 106.6872
        },
        // ...
      ],
      "shopping_malls": [
        {
          "id": 3,
          "name": "Vincom Center",
          "address": "72 Lê Thánh Tôn, Quận 1, TP. HCM",
          "distance": 0.8,
          "lat": 10.7790,
          "lng": 106.7021
        },
        // ...
      ]
    }
  }
}
```

## Mã lỗi

- `400 Bad Request`: Yêu cầu không hợp lệ
- `404 Not Found`: Không tìm thấy tài nguyên
- `500 Internal Server Error`: Lỗi máy chủ 