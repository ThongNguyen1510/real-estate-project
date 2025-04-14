<?php 
session_start();
include_once 'header.php'; // Chỉ include header
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông Thành BĐS</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <!-- Nội dung chính -->
    <div class="main-content">
        <!-- Hero Section -->
        <section class="hero-section">
            <div class="container">
                <h1 class="display-4">Chào mừng đến với Thông Thành BĐS</h1>
                <p class="lead">Công ty hàng đầu trong lĩnh vực bất động sản</p>
                <a href="#search-section" class="btn btn-warning btn-lg">Tìm kiếm ngay</a>
            </div>
        </section>

        <!-- Phần Tìm kiếm -->
        <section id="search-section" class="search-section py-5 bg-light">
            <div class="container">
                <div class="search-wrapper bg-white rounded shadow p-4">
                    <h2 class="text-center mb-4">Tìm kiếm bất động sản</h2>
                    <div class="row g-3 align-items-end">
                        <!-- Loại BĐS -->
                        <div class="col-lg-2 col-md-4 col-6">
                            <label class="form-label small text-muted mb-1">Loại BĐS</label>
                            <select class="form-select">
                                <option value="">Tất cả</option>
                                <option value="nha-pho">Nhà phố</option>
                                <option value="can-ho">Căn hộ</option>
                                <option value="dat-nen">Đất nền</option>
                                <option value="biet-thu">Biệt thự</option>
                            </select>
                        </div>

                        <!-- Địa điểm -->
                        <div class="col-lg-3 col-md-4 col-6">
                            <label class="form-label small text-muted mb-1">Địa điểm</label>
                            <input type="text" class="form-control" placeholder="Nhập quận/huyện">
                        </div>

                        <!-- Mức giá -->
                        <div class="col-lg-2 col-md-4 col-6">
                            <label class="form-label small text-muted mb-1">Mức giá</label>
                            <select class="form-select">
                                <option value="">Tất cả</option>
                                <option value="1-ti">Dưới 1 tỷ</option>
                                <option value="1-3-ti">1 - 3 tỷ</option>
                                <option value="3-5-ti">3 - 5 tỷ</option>
                                <option value="5-10-ti">5 - 10 tỷ</option>
                                <option value="10-ti">Trên 10 tỷ</option>
                            </select>
                        </div>

                        <!-- Diện tích -->
                        <div class="col-lg-2 col-md-4 col-6">
                            <label class="form-label small text-muted mb-1">Diện tích</label>
                            <select class="form-select">
                                <option value="">Tất cả</option>
                                <option value="50">Dưới 50m²</option>
                                <option value="50-100">50 - 100m²</option>
                                <option value="100-200">100 - 200m²</option>
                                <option value="200-500">200 - 500m²</option>
                                <option value=">500">Trên 500m²</option>
                            </select>
                        </div>

                        <!-- Nút tìm kiếm -->
                        <div class="col-lg-3 col-md-4">
                            <button class="btn btn-danger w-100 py-2">
                                <i class="bi bi-search me-2"></i>Tìm kiếm
                            </button>
                        </div>
                    </div>

                    <!-- Lọc nâng cao -->
                    <div class="advanced-search mt-3">
                        <a href="#advanced" class="text-decoration-none small" data-bs-toggle="collapse">
                            <i class="bi bi-chevron-down me-1"></i>Tìm kiếm nâng cao
                        </a>
                        <div class="collapse mt-2" id="advanced">
                            <div class="row g-3">
                                <div class="col-md-3">
                                    <label class="form-label small text-muted mb-1">Hướng nhà</label>
                                    <select class="form-select">
                                        <option value="">Tất cả</option>
                                        <option value="dong">Đông</option>
                                        <option value="tay">Tây</option>
                                        <option value="nam">Nam</option>
                                        <option value="bac">Bắc</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label small text-muted mb-1">Số phòng ngủ</label>
                                    <select class="form-select">
                                        <option value="">Tất cả</option>
                                        <option value="1">1 phòng</option>
                                        <option value="2">2 phòng</option>
                                        <option value="3">3 phòng</option>
                                        <option value="4">4 phòng</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label small text-muted mb-1">Pháp lý</label>
                                    <select class="form-select">
                                        <option value="">Tất cả</option>
                                        <option value="so-do">Sổ đỏ</option>
                                        <option value="so-hong">Sổ hồng</option>
                                        <option value="giay-tay">Giấy tay</option>
                                    </select>
                                </div>
                                <div class="col-lg-2 col-md-4 col-6">
                                    <label class="form-label small text-muted mb-1">Loại giao dịch</label>
                                    <select class="form-select">
                                        <option value="">Tất cả</option>
                                        <option value="ban">Bán</option>
                                        <option value="cho-thue">Cho thuê</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Giới thiệu công ty -->
        <section class="about-section py-5">
            <div class="container">
                <h2 class="text-center mb-5">Giới thiệu về chúng tôi</h2>
                <div class="row">
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h3 class="card-title">Thông Thành BĐS</h3>
                                <p class="card-text">
                                    Chúng tôi cung cấp các giải pháp bất động sản chất lượng cao với giá cả hợp lý. Với đội ngũ chuyên nghiệp, chúng tôi cam kết mang đến sự hài lòng cho khách hàng.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h3 class="card-title">Dịch vụ của chúng tôi</h3>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item">Mua bán nhà đất</li>
                                    <li class="list-group-item">Cho thuê bất động sản</li>
                                    <li class="list-group-item">Tư vấn đầu tư bất động sản</li>
                                </ul>
                            </div>
                        </div>
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
    <!-- Custom JS -->
    <script src="scripts/main.js"></script>
</body>
</html>