<?php
session_start();
if (!isset($_SESSION['user'])) {  // Thay đổi điều kiện kiểm tra
    header('Location: login.php'); // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
    exit;
}
?>