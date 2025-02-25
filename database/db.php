<?php
$servername = "localhost";
$username = "your_ubit_username";
$password = "your_8_digit_person_number";
$database = "cse442_2025_spring_team_s_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
