<?php
session_start();
include_once 'check-login.php'; // Yêu cầu đăng nhập để đăng tin

// Thêm xử lý form ở đầu file
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    include_once 'db_connect.php';
    
    // Lấy dữ liệu từ form
    $title = $conn->real_escape_string($_POST['title']);
    $description = $conn->real_escape_string($_POST['description']);
    $type = $conn->real_escape_string($_POST['propertyType']);
    $price = floatval($_POST['price']);
    $area = floatval($_POST['area']);
    $address = $conn->real_escape_string($_POST['address']);
    $city = $conn->real_escape_string($_POST['city']);
    $district = $conn->real_escape_string($_POST['district']);
    
    // Thêm vào database
    $user_id = $_SESSION['user_id'];
    $sql = "INSERT INTO properties (user_id, title, description, type, price, area, address, city, district) 
            VALUES ($user_id, '$title', '$description', '$type', $price, $area, '$address', '$city', '$district')";
    
    if ($conn->query($sql)) {
        $success_message = "Đăng tin thành công!";
    } else {
        $error_message = "Lỗi: " . $conn->error;
    }
    
    $conn->close();
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng tin - Thông Thành BĐS</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles/main.css">
    <style>
        .post-form-section {
            background: #f4f6f9;
            padding: 2rem 0;
            padding-top: 150px; /* Thêm padding-top để tránh header */
        }
        .section-title {
            border-bottom: 2px solid #e0e6ed;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
            font-weight: 600;
        }
        .required-label:after {
            content: "*";
            color: red;
            margin-left: 3px;
        }
        .image-upload {
            border: 2px dashed #ddd;
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
        }
        .image-upload:hover {
            color: #2a3950;
            border-bottom: 2px solid #e0e6ed;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
            font-weight: 600;
        }
        .price-unit {
            border-radius: 0 5px 5px 0;
            background: #e0e6ed;
        }
    </style>
</head>

<body>
    <?php include 'check-login.php'; ?>
    <?php include 'header.php'; ?>

    <!-- Form Section -->
    <section class="post-form-section">
        <div class="container">
            <div class="form-card">
                <h3 class="section-title">Đăng tin mới</h3>
                
                <form method="POST" action="" enctype="multipart/form-data">
                    <!-- Loại tin đăng -->
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <label class="form-label required-label">Loại tin đăng</label>
                            <div class="d-flex gap-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="postType" id="sell" checked>
                                    <label class="form-check-label" for="sell">
                                        <i class="fas fa-handshake"></i> Cần bán
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="postType" id="rent">
                                    <label class="form-check-label" for="rent">
                                        <i class="fas fa-house-circle-check"></i> Cho thuê
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Thông tin BĐS -->
                    <div class="row mb-4">
                        <div class="col-md-6 mb-3">
                            <label class="form-label required-label">Loại BĐS</label>
                            <select class="form-select" name="propertyType">
                                <option value="">Chọn loại BĐS</option>
                                <option>Nhà phố</option>
                                <option>Căn hộ chung cư</option>
                                <option>Đất nền</option>
                                <option>Biệt thự</option>
                                <option>Văn phòng</option>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label required-label">Tỉnh/Thành phố</label>
                            <select class="form-select" name="city">
                                <option value="">Chọn tỉnh/thành phố</option>
                                <option>Hồ Chí Minh</option>
                                <option>Hà Nội</option>
                                <option>Đà Nẵng</option>
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label required-label">Quận/Huyện</label>
                            <select class="form-select" name="district">
                                <option value="">Chọn quận/huyện</option>
                                <option>Quận 1</option>
                                <option>Quận 2</option>
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label required-label">Diện tích (m²)</label>
                            <input type="number" class="form-control" name="area" placeholder="Ví dụ: 50">
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label required-label">Mức giá</label>
                            <div class="input-group">
                                <input type="number" class="form-control" name="price" placeholder="Nhập giá">
                                <select class="form-select price-unit">
                                    <option>Tỷ</option>
                                    <option>Triệu</option>
                                    <option>Triệu/m²</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Địa chỉ chi tiết -->
                    <div class="row mb-4">
                        <div class="col-md-12 mb-3">
                            <label class="form-label required-label">Địa chỉ chi tiết</label>
                            <input type="text" class="form-control" name="address" placeholder="Số nhà, tên đường">
                        </div>
                    </div>

                    <!-- Tiêu đề và Mô tả -->
                    <div class="row mb-4">
                        <div class="col-md-12 mb-3">
                            <label class="form-label required-label">Tiêu đề tin đăng</label>
                            <input type="text" class="form-control" name="title" placeholder="Ví dụ: Bán nhà mặt tiền Q1, 100m²">
                        </div>
                        
                        <div class="col-md-12 mb-3">
                            <label class="form-label required-label">Nội dung mô tả</label>
                            <textarea class="form-control" name="description" rows="5" placeholder="Mô tả chi tiết về BĐS..."></textarea>
                        </div>
                    </div>

                    <!-- Hình ảnh đính kèm -->
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <label class="form-label required-label">Hình ảnh đính kèm</label>
                            <div class="image-upload" id="imageUpload">
                                <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                                <h5>Kéo thả ảnh vào đây hoặc <span class="text-primary">chọn ảnh</span></h5>
                                <input type="file" id="imageInput" multiple accept="image/*">
                                <p class="text-muted">Tối đa 20 ảnh (JPG, PNG)</p>
                            </div>
                            <div class="preview-images" id="previewImages"></div>
                        </div>
                    </div>

                    <!-- Thông tin liên hệ -->
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <h5 class="section-title">Thông tin liên hệ</h5>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label required-label">Tên liên hệ</label>
                            <input type="text" class="form-control">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label required-label">Số điện thoại</label>
                            <input type="tel" class="form-control">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label required-label">Email</label>
                            <input type="email" class="form-control">
                        </div>
                    </div>

                    <!-- Nút đăng tin -->
                    <div class="row">
                        <div class="col-md-12">
                            <button class="btn btn-primary btn-lg w-100">
                                <i class="fas fa-paper-plane me-2"></i> Đăng tin ngay
                            </button>
                            <p class="text-muted mt-2">Bằng cách nhấn Đăng tin, bạn đồng ý với Điều khoản sử dụng của chúng tôi</p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p>&copy; 2023 Thông Thành BĐS. All rights reserved.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.getElementById("imageUpload").addEventListener("click", function() {
            document.getElementById("imageInput").click();
        });

        document.getElementById("imageInput").addEventListener("change", function(event) {
            const previewContainer = document.getElementById("previewImages");
            previewContainer.innerHTML = "";
            const files = event.target.files;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = document.createElement("img");
                        img.src = e.target.result;
                        previewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    </script>
</body>
</html>