# 🏡 Xây dựng website tìm kiếm và cho thuê bất động sản với công nghệ bản đồ số

## 📌 Giới thiệu
Dự án này là một nền tảng giúp người dùng dễ dàng tìm kiếm, cho thuê và mua bán bất động sản thông qua bản đồ số. Hệ thống hỗ trợ đăng tin rao bán/cho thuê, tìm kiếm thông tin chi tiết và kết nối giữa người mua và người bán.

## 🚀 Công nghệ sử dụng
- **Backend:** Node.js, Express.js, SQL Server
- **Frontend:** React.js (do thành viên frontend đảm nhiệm)
- **Database:** Microsoft SQL Server
- **Bản đồ số:** Google Maps API / OpenStreetMap
- **Authentication:** JSON Web Token (JWT)
- **Deployment:** Docker, CI/CD, Cloud Services (AWS/Azure)

## 📂 Cấu trúc thư mục
```
DoAnCoSo/
│── config/               # Cấu hình cơ sở dữ liệu
│── controllers/          # Xử lý logic API
│── routes/               # Định nghĩa các tuyến API
│── models/               # Định nghĩa bảng và mô hình dữ liệu
│── views/                # Giao diện frontend (nếu có)
│── .env                  # Biến môi trường
│── index.js              # Điểm bắt đầu của server
│── server.js             # Khởi chạy ứng dụng
│── package.json          # Thông tin project & dependencies
```

## 🔧 Cài đặt & Chạy dự án
### 1️⃣ Cài đặt dependencies
```sh
npm install
```

### 2️⃣ Cấu hình biến môi trường
Tạo file `.env` và điền thông tin:
```
DB_USER=sa
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_NAME=RealEstateDB
DB_PORT=1433
PORT=9000
JWT_SECRET=your_secret_key
```

### 3️⃣ Chạy server
```sh
npm start
```
Mở trình duyệt và truy cập: `http://localhost:9000`

## 🔥 API Endpoints
| Method  | Endpoint               | Chức năng                          |
|---------|------------------------|-----------------------------------|
| GET     | /api/properties        | Lấy danh sách bất động sản        |
| GET     | /api/properties/:id    | Lấy thông tin chi tiết BĐS        |
| POST    | /api/properties        | Thêm mới bất động sản             |
| PUT     | /api/properties/:id    | Cập nhật thông tin BĐS            |
| DELETE  | /api/properties/:id    | Xóa một bất động sản              |
| POST    | /api/auth/register     | Đăng ký tài khoản                 |
| POST    | /api/auth/login        | Đăng nhập                         |

## 📌 Đóng góp
1. Fork repository này
2. Tạo một branch mới (`git checkout -b feature-new`)
3. Commit thay đổi (`git commit -m "Thêm tính năng mới"`)
4. Push lên branch (`git push origin feature-new`)
5. Tạo Pull Request

## 📜 Giấy phép
Dự án này được phát hành theo giấy phép **MIT License**.

---
**🚀 Cùng nhau xây dựng một nền tảng bất động sản hiện đại và tiện lợi!**

