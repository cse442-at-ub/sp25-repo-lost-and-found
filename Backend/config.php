<?php
// database.php - Handles database connection

$host = "aptitude.cse.buffalo.edu";
$dbname = "cse442_2025_spring_team_s_db";
$username = "shanoyah";
$password = "50400377";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;

}
?>
