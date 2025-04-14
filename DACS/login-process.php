<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost"; 
$username = "root"; 
$password = ""; 
$dbname = "bat_dong_san"; 

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}

$username = $_POST['username'];
$password = $_POST['password'];

if (empty($username) || empty($password)) {
    echo 'Tên đăng nhập và mật khẩu là bắt buộc';
    exit;
}

$sql = "SELECT * FROM users WHERE username='$username'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    if (password_verify($password, $row['password'])) {
        $_SESSION['user'] = $row['username'];
        header("Location: index.php");
        exit();
    } else {
        echo "Mật khẩu không chính xác!";
    }
} else {
    echo "Tên đăng nhập không tồn tại!";
}

$conn->close();
?>