<?php
session_start(); // Bắt đầu phiên làm việc

// Kiểm tra xem người dùng đã đăng nhập chưa
if (isset($_SESSION['user'])) {
    // Nếu đã đăng nhập, chuyển hướng đến trang chính
    header('Location: index.php');
    exit; // Dừng thực thi mã sau khi chuyển hướng
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng nhập - Thông Thành BĐS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <?php include 'header.php'; ?>

    <!-- Form đăng nhập -->
    <div class="main-content">
        <section class="login-section py-5">
            <div class="container">
                <h2 class="text-center mb-5">Đăng nhập</h2>
                <form class="bg-light p-4 rounded shadow" method="POST" action="login-process.php">
                    <div class="mb-3">
                        <label for="username" class="form-label">Tên đăng nhập</label>
                        <input type="text" class="form-control" id="username" name="username" required>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Mật khẩu</label>
                        <input type="password" class="form-control" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Đăng nhập</button>
                    <p class="text-center mt-3">
                        Chưa có tài khoản? <a href="register.php">Đăng ký ngay</a>
                    </p>
                </form>
            </div>
        </section>
    </div>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p>&copy; 2025 Thông Thành BĐS. All rights reserved.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"></script>
    <script src="scripts/main.js"></script>
</body>
</html>