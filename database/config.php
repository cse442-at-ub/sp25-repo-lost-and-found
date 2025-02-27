<?php
header("Content-Type: application/json");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database credentials
define("DB_SERVER", "aptitude.cse.buffalo.edu");
define("DB_USERNAME", "dinalben");
define("DB_PASSWORD", "50409149");
define("DB_NAME", "cse442_2025_spring_team_s_db");

// Create connection
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
} else {
    echo json_encode([
        "success" => true,
        "message" => "Database connected successfully."
    ]);
}
?>
