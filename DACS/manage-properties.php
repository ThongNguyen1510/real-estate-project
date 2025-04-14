<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý tin đăng - Thông Thành BĐS</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles/main.css">
    <style>
        .manage-properties-section {
            background-color: #f8f9fa;
            min-height: 70vh;
        }
        
        .empty-state {
            background: white;
            border-radius: 12px;
            padding: 40px 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .property-card {
            background: white;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }

        .property-card:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <?php include 'check-login.php'; ?>
    <?php include 'header.php'; ?>

    <!-- Main Content -->
    <div class="main-content" style="padding-top: 80px;">
        <section class="manage-properties-section py-5">
            <div class="container">
                <!-- Header Section -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0">Quản lý tin đăng</h2>
                    <div class="d-flex gap-3">
                        <button class="btn btn-outline-secondary">
                            <i class="fas fa-filter"></i> Lọc tin
                        </button>
                        <a href="post-property.php" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Đăng tin mới
                        </a>
                    </div>
                </div>

                <?php
                include 'db_connect.php'; // Kết nối đến cơ sở dữ liệu

                $sql = "SELECT * FROM properties";
                $result = $conn->query($sql);
                ?>

                <!-- Empty State -->
                <?php if ($result->num_rows > 0): ?>
                    <div class="row">
                        <?php while($row = $result->fetch_assoc()): ?>
                            <div class="col-md-4 mb-4">
                                <div class="property-card p-3">
                                    <h5><?php echo $row['title']; ?></h5>
                                    <p><strong>Địa chỉ:</strong> <?php echo $row['address']; ?></p>
                                    <p><strong>Số điện thoại:</strong> <?php echo $row['contact_number']; ?></p>
                                    <p><strong>Chủ sở hữu:</strong> <?php echo $row['owner_name']; ?></p>
                                    <p><strong>Loại BĐS:</strong> <?php echo $row['property_type']; ?></p>
                                    <p><strong>Mức giá:</strong> <?php echo $row['price']; ?> triệu</p>
                                    <p><strong>Diện tích:</strong> <?php echo $row['area']; ?> m²</p>
                                    <p><strong>Mô tả:</strong> <?php echo $row['description']; ?></p>
                                </div>
                            </div>
                        <?php endwhile; ?>
                    </div>
                <?php else: ?>
                    <div class="empty-state text-center py-5">
                        <h4 class="mb-3">Bạn chưa có tin đăng nào</h4>
                        <p class="text-muted mb-4">Hãy bắt đầu bằng cách đăng tin mới để khách hàng có thể xem được BĐS của bạn</p>
                        <a href="post-property.php" class="btn btn-primary btn-lg">
                            <i class="fas fa-plus me-2"></i> Đăng tin ngay
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </section>
    </div>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p>&copy; 2023 Thông Thành BĐS. All rights reserved.</p>
        </div>
    </footer>

    <!-- Bootstrap JS và Popper.js -->
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"></script>
    <!-- Custom JS -->
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Lấy đường dẫn hiện tại
            const currentPath = window.location.pathname.split('/').pop();

            // Danh sách các mục header
            const navItems = document.querySelectorAll('.navbar-nav .nav-item');

            navItems.forEach(item => {
                const link = item.querySelector('.nav-link');
                const href = link.getAttribute('href');

                // Kiểm tra nếu đường dẫn trùng khớp
                if (href === currentPath) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        });
    </script>
</body>
</html>