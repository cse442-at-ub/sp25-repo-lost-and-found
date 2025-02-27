<?php
$servername = "localhost";   
$port = 3306;                
$username = "jxboulwa";
$password = "50456062";
$database = "cse442_2025_spring_team_s_db";

try {
    $conn = new PDO("mysql:host=$servername;port=$port;dbname=$database;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connected successfully!";
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage();
}
?>