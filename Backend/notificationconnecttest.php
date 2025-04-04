<?php
// Test database connection and insertion
$host = 'localhost';
$dbname = 'cse442_2025_spring_team_s_db';
$username = 'dinalben'; // Use your database username
$password = '50409149'; // Use your database password

try {
    $conn = new mysqli($host, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    echo "Database connection successful!\n";
    
    // Test insert into notification_system
    $userId = 9; // Replace with a valid user ID
    $title = "Test Notification";
    $message = "This is a test notification";
    $type = "info";
    
    $stmt = $conn->prepare("INSERT INTO notification_system 
        (user_id, title, message, type) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $userId, $title, $message, $type);
    
    if ($stmt->execute()) {
        echo "Test notification created successfully!\n";
    } else {
        echo "Failed to create test notification: " . $stmt->error . "\n";
    }
    
    $conn->close();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>