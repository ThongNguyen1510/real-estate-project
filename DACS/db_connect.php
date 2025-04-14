<?php
$servername = "localhost"; // Thường là localhost
$username = "root"; // Tên người dùng (thường là root)
$password = ""; // Mật khẩu (nếu có)
$dbname = "bat_dong_san"; // Tên cơ sở dữ liệu

// Tạo kết nối
$conn = new mysqli($servername, $username, $password, $dbname);

// Kiểm tra kết nối
if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}
echo "Kết nối thành công";
?>