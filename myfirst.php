<?php
$servername = "localhost";  // Connect through the SSH tunnel
$port = 3306;               // Use the local forwarded port
$username = "jxboulwa";
$password = "50456062";

try {
    $conn = new PDO("mysql:host=$servername;port=$port;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connected successfully!";
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage();
}
?>
