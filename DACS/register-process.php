<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost"; 
$db_username = "root"; 
$db_password = ""; 
$dbname = "bat_dong_san"; 

$conn = new mysqli($servername, $db_username, $db_password, $dbname);

if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}

$username = $conn->real_escape_string($_POST['username']);
$email = $conn->real_escape_string($_POST['email']);
$password = $_POST['password'];
$confirm_password = $_POST['confirm-password'];

if (empty($username) || empty($email) || empty($password)) {
    echo 'Tên đăng nhập, email và mật khẩu là bắt buộc';
    exit;
}

if ($password !== $confirm_password) {
    echo "Mật khẩu không khớp!";
    exit;
}

$sql_check = "SELECT * FROM users WHERE username='$username'";
$result_check = $conn->query($sql_check);

if ($result_check->num_rows > 0) {
    echo "Tên đăng nhập đã tồn tại!";
    exit;
}

$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$sql = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$hashed_password')";

if ($conn->query($sql) === TRUE) {
    header("Location: login.php");
    exit();
} else {
    echo "Lỗi: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>