# API Quản lý Tin tức (News API)

## Tổng quan

API Quản lý Tin tức cung cấp các endpoint để truy xuất và quản lý tin tức và bài viết liên quan đến thị trường bất động sản, các chính sách mới, và tin tức về dự án.

## Base URL

```
https://api.realestate.com/api/news
```

## Xác thực

- Các endpoint công khai (GET) không yêu cầu xác thực
- Các endpoint quản trị (POST, PUT, DELETE) yêu cầu xác thực bằng JWT token và quyền admin

```
Authorization: Bearer {token}
```

## Endpoints

### 1. Lấy danh sách tin tức

```
GET /
```

Trả về danh sách tin tức, có thể được lọc theo danh mục.

#### Query Parameters

| Parameter    | Type    | Description                                |
|--------------|---------|--------------------------------------------|
| category_id  | integer | Lọc theo danh mục tin tức                  |
| keyword      | string  | Tìm kiếm theo từ khóa                     |
| page         | integer | Số trang (mặc định: 1)                    |
| limit        | integer | Số lượng kết quả mỗi trang (mặc định: 10) |
| sort         | string  | Sắp xếp ('newest', 'popular', mặc định: 'newest') |

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "title": "Thị trường bất động sản quý 2/2023",
      "summary": "Báo cáo tình hình thị trường bất động sản quý 2 năm 2023",
      "content": "Nội dung bài viết đầy đủ...",
      "thumbnail": "https://api.realestate.com/images/news/q2-2023.jpg",
      "category_id": 1,
      "category_name": "Phân tích thị trường",
      "author": "Nguyễn Văn A",
      "published_at": "2023-07-10T08:15:30Z",
      "views": 1250,
      "tags": ["thị trường", "báo cáo", "quý 2"]
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

### 2. Lấy danh sách danh mục tin tức

```
GET /categories
```

Trả về danh sách các danh mục tin tức.

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "Phân tích thị trường",
      "slug": "phan-tich-thi-truong",
      "description": "Các bài phân tích về thị trường bất động sản",
      "news_count": 15
    },
    {
      "id": 2,
      "name": "Chính sách mới",
      "slug": "chinh-sach-moi",
      "description": "Cập nhật chính sách, luật liên quan đến bất động sản",
      "news_count": 8
    }
  ]
}
```

### 3. Lấy chi tiết tin tức

```
GET /:id
```

Lấy thông tin chi tiết của một bài tin tức.

#### URL Parameters

| Parameter | Type    | Description    |
|-----------|---------|----------------|
| id        | integer | ID của bài tin |

#### Response

```json
{
  "id": 1,
  "title": "Thị trường bất động sản quý 2/2023",
  "summary": "Báo cáo tình hình thị trường bất động sản quý 2 năm 2023",
  "content": "<p>Nội dung bài viết đầy đủ với định dạng HTML...</p>",
  "thumbnail": "https://api.realestate.com/images/news/q2-2023.jpg",
  "category_id": 1,
  "category_name": "Phân tích thị trường",
  "author": "Nguyễn Văn A",
  "published_at": "2023-07-10T08:15:30Z",
  "views": 1250,
  "tags": ["thị trường", "báo cáo", "quý 2"],
  "related_news": [
    {
      "id": 5,
      "title": "Thị trường bất động sản quý 1/2023",
      "thumbnail": "https://api.realestate.com/images/news/q1-2023.jpg",
      "published_at": "2023-04-12T10:00:00Z"
    }
  ]
}
```

### 4. Tạo tin tức mới (Admin)

```
POST /
```

Tạo một bài tin tức mới (yêu cầu quyền admin).

#### Body Parameters

| Parameter    | Type    | Required | Description                            |
|--------------|---------|----------|----------------------------------------|
| title        | string  | Yes      | Tiêu đề bài viết                      |
| summary      | string  | Yes      | Tóm tắt bài viết                      |
| content      | string  | Yes      | Nội dung đầy đủ (hỗ trợ HTML)         |
| thumbnail    | file    | No       | Ảnh đại diện cho bài viết             |
| category_id  | integer | Yes      | ID danh mục                           |
| tags         | array   | No       | Mảng các tag                          |
| published_at | datetime| No       | Thời gian xuất bản (mặc định: ngay lập tức) |
| status       | string  | No       | Trạng thái (draft, published, mặc định: published) |

#### Response (201 Created)

```json
{
  "message": "News created successfully",
  "id": 28
}
```

### 5. Cập nhật tin tức (Admin)

```
PUT /:id
```

Cập nhật thông tin của một bài tin tức (yêu cầu quyền admin).

#### URL Parameters

| Parameter | Type    | Description    |
|-----------|---------|----------------|
| id        | integer | ID của bài tin |

#### Body Parameters

| Parameter    | Type    | Description                            |
|--------------|---------|----------------------------------------|
| title        | string  | Tiêu đề bài viết                      |
| summary      | string  | Tóm tắt bài viết                      |
| content      | string  | Nội dung đầy đủ (hỗ trợ HTML)         |
| thumbnail    | file    | Ảnh đại diện cho bài viết             |
| category_id  | integer | ID danh mục                           |
| tags         | array   | Mảng các tag                          |
| published_at | datetime| Thời gian xuất bản                    |
| status       | string  | Trạng thái (draft, published)         |

#### Response

```json
{
  "message": "News updated successfully"
}
```

### 6. Xóa tin tức (Admin)

```
DELETE /:id
```

Xóa một bài tin tức (yêu cầu quyền admin).

#### URL Parameters

| Parameter | Type    | Description    |
|-----------|---------|----------------|
| id        | integer | ID của bài tin |

#### Response

```json
{
  "message": "News deleted successfully"
}
```

## Mã lỗi

| Status Code | Error Code | Description                           |
|-------------|------------|---------------------------------------|
| 400         | 400        | Dữ liệu không hợp lệ                 |
| 401         | 401        | Chưa đăng nhập                       |
| 403         | 403        | Không có quyền truy cập              |
| 404         | 404        | Tin tức không tồn tại                |
| 500         | 500        | Lỗi máy chủ                          |

## Trạng thái tin tức

- draft: Bản nháp, chưa xuất bản
- published: Đã xuất bản, hiển thị công khai

## Danh mục tin tức

Các danh mục tin tức tiêu biểu:

- Phân tích thị trường
- Chính sách và quy định
- Dự án mới
- Tin tức đầu tư
- Tư vấn bất động sản
- Kiến thức mua bán nhà đất 