# API Quản lý Tài liệu (Documents API)

## Tổng quan

API Quản lý Tài liệu cho phép người dùng tải lên, quản lý và chia sẻ các tài liệu liên quan đến bất động sản như hợp đồng, giấy tờ pháp lý, hình ảnh và các loại file khác.

## Base URL

```
https://api.realestate.com/api/documents
```

## Xác thực

Tất cả các endpoint đều yêu cầu xác thực bằng JWT token trong header.

```
Authorization: Bearer {token}
```

## Endpoints

### 1. Lấy danh sách tài liệu

```
GET /
```

Trả về danh sách tài liệu của người dùng và các tài liệu được chia sẻ với họ.

#### Query Parameters

| Parameter     | Type    | Description                                      |
|---------------|---------|--------------------------------------------------|
| property_id   | integer | Lọc theo ID bất động sản                         |
| user_id       | integer | Lọc theo người dùng (mặc định là người dùng hiện tại) |
| document_type | string  | Lọc theo loại tài liệu                          |
| status        | string  | Lọc theo trạng thái (mặc định: 'active')        |
| page          | integer | Số trang (mặc định: 1)                          |
| limit         | integer | Số lượng kết quả mỗi trang (mặc định: 10)       |

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "title": "Hợp đồng mua bán",
      "description": "Hợp đồng mua bán căn hộ",
      "file_name": "hopdongnew.pdf",
      "file_type": "application/pdf",
      "file_size": 2500000,
      "document_type": "contract",
      "property_id": 123,
      "user_id": 456,
      "is_public": 0,
      "status": "active",
      "created_at": "2023-06-15T10:20:30Z",
      "updated_at": "2023-06-15T10:20:30Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 25
  }
}
```

### 2. Tải lên tài liệu mới

```
POST /
```

Tải lên tài liệu mới.

#### Body Parameters (multipart/form-data)

| Parameter     | Type    | Required | Description                            |
|---------------|---------|----------|----------------------------------------|
| file          | file    | Yes      | File tài liệu (tối đa 10MB)           |
| title         | string  | Yes      | Tiêu đề tài liệu                      |
| description   | string  | No       | Mô tả tài liệu                        |
| document_type | string  | No       | Loại tài liệu (mặc định: 'other')     |
| property_id   | integer | No       | ID bất động sản liên quan             |
| is_public     | boolean | No       | Tài liệu công khai hay không (mặc định: false) |

#### Response (201 Created)

```json
{
  "message": "Document uploaded successfully",
  "id": 45
}
```

### 3. Lấy danh sách tài liệu được chia sẻ

```
GET /shared
```

Trả về danh sách tài liệu được chia sẻ với người dùng hiện tại.

#### Response

```json
{
  "data": [
    {
      "id": 2,
      "title": "Giấy chứng nhận quyền sở hữu",
      "description": "Giấy chứng nhận quyền sở hữu căn hộ",
      "file_name": "certificate.pdf",
      "file_type": "application/pdf",
      "file_size": 1200000,
      "document_type": "certificate",
      "property_id": 124,
      "user_id": 789,
      "is_public": 0,
      "status": "active",
      "shared_by": 789,
      "permission": "view",
      "created_at": "2023-06-16T09:15:20Z",
      "updated_at": "2023-06-16T09:15:20Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 3
  }
}
```

### 4. Lấy chi tiết tài liệu

```
GET /:id
```

Lấy thông tin chi tiết của một tài liệu.

#### URL Parameters

| Parameter | Type    | Description    |
|-----------|---------|----------------|
| id        | integer | ID của tài liệu |

#### Response

```json
{
  "id": 1,
  "title": "Hợp đồng mua bán",
  "description": "Hợp đồng mua bán căn hộ",
  "file_name": "hopdongnew.pdf",
  "file_type": "application/pdf",
  "file_size": 2500000,
  "document_type": "contract",
  "property_id": 123,
  "user_id": 456,
  "is_public": 0,
  "status": "active",
  "created_at": "2023-06-15T10:20:30Z",
  "updated_at": "2023-06-15T10:20:30Z"
}
```

### 5. Cập nhật thông tin tài liệu

```
PUT /:id
```

Cập nhật thông tin của một tài liệu.

#### URL Parameters

| Parameter | Type    | Description    |
|-----------|---------|----------------|
| id        | integer | ID của tài liệu |

#### Body Parameters

| Parameter     | Type    | Description                            |
|---------------|---------|----------------------------------------|
| title         | string  | Tiêu đề tài liệu                      |
| description   | string  | Mô tả tài liệu                        |
| status        | string  | Trạng thái tài liệu                   |

#### Response

```json
{
  "message": "Document updated successfully"
}
```

### 6. Xóa tài liệu

```
DELETE /:id
```

Xóa một tài liệu.

#### URL Parameters

| Parameter | Type    | Description    |
|-----------|---------|----------------|
| id        | integer | ID của tài liệu |

#### Response

```json
{
  "message": "Document deleted successfully"
}
```

### 7. Chia sẻ tài liệu

```
POST /:id/share
```

Chia sẻ tài liệu với người dùng khác.

#### URL Parameters

| Parameter | Type    | Description    |
|-----------|---------|----------------|
| id        | integer | ID của tài liệu |

#### Body Parameters

| Parameter    | Type    | Required | Description                             |
|--------------|---------|----------|-----------------------------------------|
| user_id      | integer | Yes      | ID người dùng được chia sẻ             |
| permission   | string  | No       | Quyền (view/edit, mặc định: 'view')    |
| access_token | string  | No       | Token truy cập (tự động tạo nếu không có) |

#### Response

```json
{
  "message": "Document shared successfully",
  "access_token": "f8a7c6b5d4e3a2b1c0d9e8f7a6b5c4d3"
}
```

### 8. Tải xuống tài liệu

```
GET /:id/download
```

Tải xuống file tài liệu.

#### URL Parameters

| Parameter | Type    | Description    |
|-----------|---------|----------------|
| id        | integer | ID của tài liệu |

#### Response

File tài liệu sẽ được gửi trực tiếp cho client để tải xuống.

## Mã lỗi

| Status Code | Error Code | Description                           |
|-------------|------------|---------------------------------------|
| 400         | 400        | Dữ liệu không hợp lệ                 |
| 403         | 403        | Không có quyền truy cập              |
| 404         | 404        | Tài liệu không tồn tại               |
| 500         | 500        | Lỗi máy chủ                          |

## Loại tài liệu

Các loại tài liệu hỗ trợ:

- contract: Hợp đồng
- certificate: Giấy chứng nhận
- legal_document: Giấy tờ pháp lý
- photo: Hình ảnh
- blueprint: Bản vẽ
- financial: Tài liệu tài chính
- other: Loại khác

## Loại file hỗ trợ

- application/pdf
- image/jpeg
- image/png
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document
- application/vnd.ms-excel
- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- text/plain
- application/zip
- application/x-zip-compressed
- video/mp4
- video/quicktime

Kích thước tối đa: 10MB 