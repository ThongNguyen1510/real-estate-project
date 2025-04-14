<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chi tiết BĐS - Thông Thành BĐS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <?php include 'check-login.php'; ?>
    <?php include 'header.php'; ?>

    <!-- Nội dung chính -->
    <div class="main-content">
        <section class="property-detail-section py-5">
            <div class="container">
                <h2 class="text-center mb-5">Chi tiết BĐS</h2>
                <!-- Thông tin chi tiết BĐS -->
                <div class="row">
                    <div class="col-md-6">
                        <img src="path/to/image.jpg" class="img-fluid" alt="Chi tiết BĐS">
                    </div>
                    <div class="col-md-6">
                        <h3>Tên BĐS</h3>
                        <p><strong>Loại BĐS:</strong> Nhà phố</p>
                        <p><strong>Địa chỉ:</strong> Số nhà, tên đường, Quận, Thành phố</p>
                        <p><strong>Diện tích:</strong> 100m²</p>
                        <p><strong>Mức giá:</strong> 2 tỷ</p>
                        <p><strong>Mô tả:</strong> Mô tả chi tiết về BĐS...</p>
                        <button class="btn btn-primary">Liên hệ</button>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p>&copy; 2025 Thông Thành BĐS. All rights reserved.</p>
        </div>
    </footer>

    <!-- Bootstrap JS và Popper.js -->
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"></script>
    <script src="scripts/main.js"></script>
</body>
</html>