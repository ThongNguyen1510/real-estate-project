<nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
    <div class="container">
        <a class="navbar-brand" href="index.php">Thông Thành BĐS</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <?php if (!isset($_SESSION['user'])) { ?>
                    <li class="nav-item">
                        <a class="nav-link" href="register.php">Đăng ký</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="login.php">Đăng nhập</a>
                    </li>
                <?php } else { ?>
                    <li class="nav-item">
                        <a class="nav-link" href="index.php">Trang chủ</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="post-property.php">Đăng tin</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="manage-properties.php">Quản lý tin đăng</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="property-detail.php">Chi tiết BĐS</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="logout.php">Đăng xuất</a>
                    </li>
                <?php } ?>
            </ul>
        </div>
    </div>
</nav>