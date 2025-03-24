<?php
// Database configuration
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'jxboulwa';
$password = '50456062';

$_pdo = null;

// Database connection function
function getDbConnection() {
  global $host, $dbname, $username, $password, $_pdo;
  try {
    if (is_null($_pdo)) {
      $_pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
      $_pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    return $_pdo;
  } catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500); // Internal Server Error
    exit("Database error.");
  }
}
?>