# API Bản đồ (Map API)

API bản đồ cung cấp các endpoint để tìm kiếm và hiển thị bất động sản trên bản đồ, cũng như các tính năng định vị và tìm đường đi.

## Base URL

```
/api/map
```

## Endpoints bản đồ

### Lấy bất động sản trên bản đồ

```
GET /api/map/properties
```

**Tham số query:**
- `lat`: Vĩ độ trung tâm (latitude)
- `lng`: Kinh độ trung tâm (longitude)
- `radius`: Bán kính tìm kiếm tính bằng km (mặc định: 5)
- `zoom`: Mức zoom của bản đồ (1-20, không bắt buộc)
- `property_type`: Loại bất động sản (apartment, house, villa, land, office, ...)
- `transaction_type`: Loại giao dịch (sale, rent)
- `price_min`: Giá tối thiểu
- `price_max`: Giá tối đa
- `area_min`: Diện tích tối thiểu
- `area_max`: Diện tích tối đa
- `bedroom_count`: Số phòng ngủ
- `bathroom_count`: Số phòng tắm
- `bounds`: Ranh giới bản đồ (định dạng: nelat,nelng,swlat,swlng - northeast latitude, northeast longitude, southwest latitude, southwest longitude)
- `cluster`: Gom nhóm kết quả (true/false, mặc định: true)
- `limit`: Số kết quả tối đa (mặc định: 200)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": 123,
        "title": "Căn hộ cao cấp tại The Manor",
        "property_type": "apartment",
        "transaction_type": "sale",
        "price": 2000000000,
        "area": 85,
        "bedroom_count": 2,
        "bathroom_count": 2,
        "latitude": 10.7912,
        "longitude": 106.7201,
        "address": "91 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. HCM",
        "image": "https://example.com/images/property123_1.jpg"
      },
      // ...
    ],
    "clusters": [
      {
        "id": "cluster-1",
        "latitude": 10.7890,
        "longitude": 106.7150,
        "count": 15,
        "bounds": {
          "northeast": {
            "latitude": 10.7950,
            "longitude": 106.7210
          },
          "southwest": {
            "latitude": 10.7830,
            "longitude": 106.7090
          }
        }
      },
      // ...
    ],
    "bounds": {
      "northeast": {
        "latitude": 10.8200,
        "longitude": 106.7500
      },
      "southwest": {
        "latitude": 10.7600,
        "longitude": 106.6900
      }
    },
    "center": {
      "latitude": 10.7900,
      "longitude": 106.7200
    },
    "total_count": 45
  }
}
```

### Lấy chi tiết cụm bất động sản (Cluster)

```
GET /api/map/clusters/:id
```

**Tham số query:**
- `zoom`: Mức zoom hiện tại của bản đồ (1-20)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "cluster": {
      "id": "cluster-1",
      "latitude": 10.7890,
      "longitude": 106.7150,
      "count": 15,
      "properties": [
        {
          "id": 123,
          "title": "Căn hộ cao cấp tại The Manor",
          "property_type": "apartment",
          "transaction_type": "sale",
          "price": 2000000000,
          "area": 85,
          "latitude": 10.7912,
          "longitude": 106.7201,
          "image": "https://example.com/images/property123_1.jpg"
        },
        // ...
      ],
      "sub_clusters": [
        {
          "id": "sub-cluster-1",
          "latitude": 10.7880,
          "longitude": 106.7140,
          "count": 8
        },
        {
          "id": "sub-cluster-2",
          "latitude": 10.7900,
          "longitude": 106.7160,
          "count": 7
        }
      ]
    }
  }
}
```

### Lấy thông tin khu vực trên bản đồ

```
GET /api/map/areas
```

**Tham số query:**
- `type`: Loại khu vực (city, district, ward)
- `parent_id`: ID của khu vực cha (không bắt buộc)
- `property_count`: Bao gồm số lượng bất động sản (true/false, mặc định: true)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "areas": [
      {
        "id": 1,
        "name": "Quận 1",
        "type": "district",
        "parent_id": 1,
        "parent_name": "Hồ Chí Minh",
        "bounds": {
          "northeast": {
            "latitude": 10.7950,
            "longitude": 106.7210
          },
          "southwest": {
            "latitude": 10.7830,
            "longitude": 106.7090
          }
        },
        "center": {
          "latitude": 10.7890,
          "longitude": 106.7150
        },
        "property_count": 320,
        "avg_price": 35000000
      },
      // ...
    ]
  }
}
```

### Lấy ranh giới của khu vực

```
GET /api/map/areas/:id/bounds
```

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "area": {
      "id": 1,
      "name": "Quận 1",
      "type": "district",
      "parent_id": 1,
      "parent_name": "Hồ Chí Minh",
      "bounds": {
        "northeast": {
          "latitude": 10.7950,
          "longitude": 106.7210
        },
        "southwest": {
          "latitude": 10.7830,
          "longitude": 106.7090
        }
      },
      "center": {
        "latitude": 10.7890,
        "longitude": 106.7150
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [106.7090, 10.7830],
            [106.7210, 10.7830],
            [106.7210, 10.7950],
            [106.7090, 10.7950],
            [106.7090, 10.7830]
          ]
        ]
      }
    }
  }
}
```

## Endpoints mật độ giá bất động sản

### Lấy dữ liệu mật độ giá

```
GET /api/map/heatmap
```

**Tham số query:**
- `bounds`: Ranh giới bản đồ (định dạng: nelat,nelng,swlat,swlng)
- `zoom`: Mức zoom của bản đồ (1-20)
- `property_type`: Loại bất động sản (không bắt buộc)
- `transaction_type`: Loại giao dịch (sale, rent - không bắt buộc)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "points": [
      {
        "latitude": 10.7912,
        "longitude": 106.7201,
        "weight": 0.85,
        "price_range": {
          "min": 1800000000,
          "max": 2200000000,
          "avg": 2000000000
        },
        "property_count": 15
      },
      // ...
    ],
    "legend": {
      "min": 800000000,
      "max": 4500000000,
      "avg": 2100000000,
      "steps": [
        {
          "color": "#00FF00",
          "value": 1000000000
        },
        {
          "color": "#FFFF00",
          "value": 2000000000
        },
        {
          "color": "#FF0000",
          "value": 4000000000
        }
      ]
    }
  }
}
```

## Endpoints tìm kiếm địa điểm

### Tìm kiếm địa điểm

```
GET /api/map/geocode
```

**Tham số query:**
- `query`: Chuỗi tìm kiếm (địa chỉ, tên địa điểm)
- `limit`: Số kết quả tối đa (mặc định: 10)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "places": [
      {
        "place_id": "ChIJ_f8a-Cgod0gRkgp9kw6lTHE",
        "name": "The Manor",
        "address": "91 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. HCM",
        "latitude": 10.7912,
        "longitude": 106.7201,
        "type": "building"
      },
      // ...
    ]
  }
}
```

### Lấy thông tin địa điểm từ tọa độ

```
GET /api/map/reverse-geocode
```

**Tham số query:**
- `lat`: Vĩ độ
- `lng`: Kinh độ

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "place": {
      "place_id": "ChIJ_f8a-Cgod0gRkgp9kw6lTHE",
      "name": "The Manor",
      "address": "91 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. HCM",
      "street": "Nguyễn Hữu Cảnh",
      "ward": "Phường 22",
      "district": "Quận Bình Thạnh",
      "city": "Hồ Chí Minh",
      "country": "Việt Nam",
      "postal_code": "700000",
      "latitude": 10.7912,
      "longitude": 106.7201,
      "type": "building"
    }
  }
}
```

## Endpoints tìm đường

### Tìm đường đi

```
GET /api/map/directions
```

**Tham số query:**
- `origin`: Điểm xuất phát (định dạng: lat,lng hoặc place_id)
- `destination`: Điểm đến (định dạng: lat,lng hoặc place_id)
- `mode`: Phương tiện di chuyển (driving, walking, bicycling, transit - mặc định: driving)
- `alternatives`: Tìm đường đi thay thế (true/false, mặc định: false)
- `transit_mode`: Loại phương tiện công cộng (bus, subway, train, tram - khi mode=transit)
- `avoid`: Tránh (tolls, highways, ferries - phân tách bằng dấu phẩy)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "routes": [
      {
        "distance": {
          "text": "5,2 km",
          "value": 5200
        },
        "duration": {
          "text": "15 phút",
          "value": 900
        },
        "summary": "Đường Nguyễn Hữu Cảnh và Đường Điện Biên Phủ",
        "legs": [
          {
            "distance": {
              "text": "5,2 km",
              "value": 5200
            },
            "duration": {
              "text": "15 phút",
              "value": 900
            },
            "start_address": "91 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. HCM",
            "end_address": "Đường Lê Lợi, Q.1, TP. HCM",
            "steps": [
              {
                "distance": {
                  "text": "0,5 km",
                  "value": 500
                },
                "duration": {
                  "text": "2 phút",
                  "value": 120
                },
                "instruction": "Đi theo hướng tây trên đường Nguyễn Hữu Cảnh",
                "travel_mode": "DRIVING"
              },
              // ...
            ]
          }
        ],
        "overview_polyline": "ytr~As}rnSjAl@\\^JVFXB\\@\\?^C\\G\\MXQT]JgDXcHTaBPqAJm@N]\\e@pA{AHSHWT{@T_BDq@?WCi@I_@_@aA",
        "warnings": [],
        "waypoints": []
      },
      // ...
    ]
  }
}
```

### Ước tính thời gian di chuyển

```
GET /api/map/distance-matrix
```

**Tham số query:**
- `origins`: Danh sách điểm xuất phát (định dạng: lat,lng|lat,lng|...)
- `destinations`: Danh sách điểm đến (định dạng: lat,lng|lat,lng|...)
- `mode`: Phương tiện di chuyển (driving, walking, bicycling, transit - mặc định: driving)

**Phản hồi thành công:**
```json
{
  "success": true,
  "data": {
    "origins": [
      "91 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh, TP. HCM"
    ],
    "destinations": [
      "Đường Lê Lợi, Q.1, TP. HCM",
      "235 Nguyễn Văn Cừ, Q.5, TP. HCM"
    ],
    "matrix": [
      [
        {
          "distance": {
            "text": "5,2 km",
            "value": 5200
          },
          "duration": {
            "text": "15 phút",
            "value": 900
          },
          "status": "OK"
        },
        {
          "distance": {
            "text": "8,5 km",
            "value": 8500
          },
          "duration": {
            "text": "25 phút",
            "value": 1500
          },
          "status": "OK"
        }
      ]
    ]
  }
}
```

## Mã lỗi

- `400 Bad Request`: Yêu cầu không hợp lệ
- `401 Unauthorized`: Không được xác thực
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `500 Internal Server Error`: Lỗi máy chủ 