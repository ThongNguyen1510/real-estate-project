# Tài liệu API Hệ thống Bất Động Sản

Tài liệu này mô tả chi tiết về các API và endpoint được sử dụng trong hệ thống ứng dụng bất động sản.

## Mục lục

- [Tổng quan](#tổng-quan)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Môi trường phát triển](#môi-trường-phát-triển)
- [Kiểm thử API](#kiểm-thử-api)
- [Cấu trúc tài liệu API](#cấu-trúc-tài-liệu)
- [Nguyên tắc API](#nguyên-tắc-api)
- [Ví dụ sử dụng](#ví-dụ-sử-dụng)
- [Đóng góp](#đóng-góp)
- [Giấy phép](#giấy-phép)

## Tổng quan

Hệ thống API Bất Động Sản cung cấp các dịch vụ backend cho ứng dụng web và mobile, cho phép người dùng đăng tin, tìm kiếm và quản lý bất động sản. Hệ thống được xây dựng trên nền tảng Node.js, Express và MongoDB, đảm bảo khả năng mở rộng và hiệu suất cao.

## Yêu cầu hệ thống

- Node.js >= 14.x
- MongoDB >= 4.4
- Redis >= 6.0 (cho cache và quản lý phiên)
- Dung lượng ổ cứng: Tối thiểu 10GB (tùy vào quy mô dữ liệu)
- RAM: Tối thiểu 4GB (khuyến nghị 8GB cho môi trường production)

## Cài đặt

### Cài đặt từ mã nguồn

```bash
# Clone repository
git clone https://github.com/your-organization/real-estate-api.git
cd real-estate-api

# Cài đặt dependencies
npm install

# Hoặc sử dụng Yarn
yarn install
```

### Sử dụng Docker

```bash
# Build image
docker build -t real-estate-api .

# Chạy container
docker run -p 3000:3000 real-estate-api
```

Hoặc sử dụng Docker Compose:

```bash
# Chạy toàn bộ hệ thống (API, MongoDB, Redis)
docker-compose up -d
```

## Cấu hình

### Biến môi trường

Tạo file `.env` trong thư mục gốc của dự án và cấu hình các biến môi trường sau:

```env
# Môi trường
NODE_ENV=development

# Cổng máy chủ
PORT=3000

# Cấu hình MongoDB
MONGODB_URI=mongodb://localhost:27017/real-estate
MONGODB_URI_TEST=mongodb://localhost:27017/real-estate-test

# JWT Secret
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400 # 24 giờ tính bằng giây

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cloudinary (lưu trữ hình ảnh)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Giới hạn tần suất
RATE_LIMIT_WINDOW=60000 # 1 phút tính bằng milliseconds
RATE_LIMIT_MAX=60 # Số yêu cầu tối đa
```

### Cấu hình Database

Dự án sử dụng MongoDB làm cơ sở dữ liệu chính. Bạn cần tạo các collection sau:

- users
- properties
- favorites
- appointments
- messages
- reports
- notifications
- locations

Schema của các collection được định nghĩa trong thư mục `src/models`.

## Chạy ứng dụng

### Phát triển

```bash
# Chạy với nodemon (tự động khởi động lại khi có thay đổi)
npm run dev

# Hoặc
yarn dev
```

### Sản xuất

```bash
# Build project
npm run build

# Chạy ứng dụng
npm start

# Hoặc
yarn build
yarn start
```

### PM2 (Quản lý tiến trình cho môi trường sản xuất)

```bash
# Cài đặt PM2
npm install -g pm2

# Chạy ứng dụng với PM2
pm2 start ecosystem.config.js

# Xem log
pm2 logs

# Theo dõi tài nguyên
pm2 monit
```

## Môi trường phát triển

### Cấu trúc thư mục

```
├── docs/            # Tài liệu API
├── src/             # Mã nguồn
│   ├── config/      # Cấu hình
│   ├── controllers/ # Controllers
│   ├── middlewares/ # Middlewares
│   ├── models/      # Models
│   ├── routes/      # Routes
│   ├── services/    # Services
│   ├── utils/       # Utilities
│   ├── app.js       # Express app
│   └── server.js    # Entry point
├── tests/           # Unit tests & integration tests
├── .env.example     # Example environment variables
├── Dockerfile       # Docker configuration
├── docker-compose.yml # Docker Compose configuration
└── package.json     # Dependencies
```

### Công cụ phát triển

- ESLint: Kiểm tra lỗi cú pháp
- Prettier: Format code
- Jest: Unit testing
- Swagger: Tài liệu API tự động

```bash
# Kiểm tra lỗi
npm run lint

# Format code
npm run format

# Chạy test
npm test
```

## Kiểm thử API

### Sử dụng Postman

1. Import file `docs/postman/Real_Estate_API.postman_collection.json` vào Postman
2. Tạo environment với các biến:
   - `baseUrl`: http://localhost:3000/api
   - `token`: JWT token sau khi đăng nhập

### Sử dụng Swagger

Swagger UI có sẵn tại đường dẫn `/api-docs` khi chạy ứng dụng ở môi trường phát triển.

```
http://localhost:3000/api-docs
```

### Sử dụng cURL

Ví dụ đăng nhập:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"example@example.com","password":"password123"}'
```

## Cấu trúc tài liệu

Tài liệu API được tổ chức theo từng module chức năng:

- [Quản lý người dùng](user_api.md) - Đăng ký, đăng nhập, quản lý hồ sơ người dùng
- [Quản lý bất động sản](property_api.md) - Tạo, cập nhật, xem và quản lý bất động sản
- [Tìm kiếm](search_api.md) - Tìm kiếm bất động sản với nhiều tiêu chí
- [Yêu thích](favorites_api.md) - Quản lý danh sách bất động sản yêu thích
- [Thông báo](notification_api.md) - Quản lý và cài đặt thông báo
- [Cuộc hẹn](appointment_api.md) - Đặt lịch và quản lý lịch hẹn xem bất động sản
- [Tin nhắn](message_api.md) - Gửi và quản lý tin nhắn giữa người dùng
- [Báo cáo](report_api.md) - Báo cáo tin đăng có vấn đề
- [Vị trí](location_api.md) - Quản lý thông tin về thành phố, quận/huyện, phường/xã
- [Bản đồ](map_api.md) - Tìm kiếm và hiển thị bất động sản trên bản đồ
- [Quản trị](admin_api.md) - Các chức năng quản trị hệ thống
- [Tài liệu](document_api.md) - Quản lý tài liệu liên quan đến bất động sản
- [Tin tức](news_api.md) - Quản lý tin tức và bài viết về thị trường bất động sản

## Nguyên tắc API

Tất cả các API trong hệ thống tuân theo một số nguyên tắc chung:

### URL cơ sở

```
https://api.batdongsan.vn/v1
```

### Định dạng dữ liệu

- Tất cả các API đều sử dụng định dạng JSON cho dữ liệu đầu vào và đầu ra
- Các request POST, PUT, PATCH sử dụng Content-Type: application/json
- Upload file sử dụng Content-Type: multipart/form-data

### Xác thực

- Hầu hết các API đều yêu cầu xác thực bằng JWT token
- Token được gửi trong header "Authorization" dưới dạng Bearer token

```
Authorization: Bearer your_jwt_token_here
```

### Phản hồi chuẩn

Tất cả các API đều trả về phản hồi theo định dạng chuẩn:

```json
{
  "success": true,
  "message": "Thông báo (nếu có)",
  "data": {
    // Dữ liệu trả về
  }
}
```

Hoặc trong trường hợp lỗi:

```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "errors": {
    // Chi tiết lỗi (nếu có)
  }
}
```

### Phân trang

Các endpoint trả về danh sách dữ liệu đều hỗ trợ phân trang với các tham số:

- `page`: Số trang (bắt đầu từ 1)
- `limit`: Số kết quả trên mỗi trang

Phản hồi sẽ bao gồm thông tin phân trang:

```json
{
  "success": true,
  "data": {
    "items": [
      // Danh sách dữ liệu
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 100,
      "items_per_page": 10
    }
  }
}
```

### Mã lỗi HTTP

- `200 OK`: Yêu cầu thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Yêu cầu không hợp lệ
- `401 Unauthorized`: Không được xác thực
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `409 Conflict`: Xung đột dữ liệu
- `422 Unprocessable Entity`: Dữ liệu không hợp lệ
- `500 Internal Server Error`: Lỗi máy chủ

## Phiên bản

Các API có thể thay đổi theo thời gian. Phiên bản hiện tại của API là v1.

## Giới hạn tần suất

Để đảm bảo hiệu suất và an ninh, các API có giới hạn số lượng yêu cầu trong một khoảng thời gian:

- 60 yêu cầu/phút cho mỗi IP
- 1000 yêu cầu/giờ cho mỗi tài khoản

Headers trả về sẽ bao gồm thông tin về giới hạn:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1623456789
```

## Ví dụ sử dụng

### JavaScript (Axios)

```javascript
// Đăng nhập
const axios = require('axios');

async function login() {
  try {
    const response = await axios.post('https://api.batdongsan.vn/v1/api/auth/login', {
      email: 'example@example.com',
      password: 'password123'
    });
    
    // Lưu token
    const token = response.data.data.token;
    
    // Sử dụng token cho các request tiếp theo
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return token;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error.response.data);
  }
}

// Lấy danh sách bất động sản
async function getProperties() {
  try {
    const response = await axios.get('https://api.batdongsan.vn/v1/api/properties', {
      params: {
        page: 1,
        limit: 10,
        property_type: 'apartment',
        city: 'Hồ Chí Minh'
      }
    });
    
    return response.data.data.properties;
  } catch (error) {
    console.error('Lỗi lấy danh sách bất động sản:', error.response.data);
  }
}

// Sử dụng async/await
(async () => {
  await login();
  const properties = await getProperties();
  console.log(properties);
})();
```

### PHP (cURL)

```php
<?php
// Đăng nhập
function login($email, $password) {
  $curl = curl_init();
  
  $data = json_encode([
    'email' => $email,
    'password' => $password
  ]);
  
  curl_setopt_array($curl, [
    CURLOPT_URL => 'https://api.batdongsan.vn/v1/api/auth/login',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $data,
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json',
      'Content-Length: ' . strlen($data)
    ]
  ]);
  
  $response = curl_exec($curl);
  curl_close($curl);
  
  return json_decode($response, true);
}

// Sử dụng API
$loginResponse = login('example@example.com', 'password123');

if ($loginResponse['success']) {
  $token = $loginResponse['data']['token'];
  
  // Sử dụng token cho các request tiếp theo
  // ...
} else {
  echo 'Lỗi đăng nhập: ' . $loginResponse['message'];
}
?>
```

## Đóng góp

Chúng tôi rất hoan nghênh các đóng góp từ cộng đồng. Để đóng góp:

1. Fork repository
2. Tạo nhánh tính năng (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'Add some amazing feature'`)
4. Push lên nhánh của bạn (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## Giấy phép

Dự án được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

## Liên hệ hỗ trợ

Nếu bạn có bất kỳ câu hỏi hoặc gặp vấn đề khi sử dụng API, vui lòng liên hệ:

- Email: api-support@batdongsan.vn
- Điện thoại: 1900 1234 