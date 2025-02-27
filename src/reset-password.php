<?php

$servername = "db";
$username = "myuser";
$password = "mypassword";
$dbname = "mydb";

function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT);
}

function verifyOTP($providedOTP) {
    // TODO verify otp tokens in db
    return $providedOTP === "000000";
}

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if ($data === null) {
        throw new Exception("Invalid JSON data.");
    }
    $email = isset($data['email']) ? $data['email'] : null;
    $otp = isset($data['otp']) ? $data['otp'] : null;
    $password = isset($data['password']) ? $data['password'] : null;
    if (empty($email) || empty($otp) || empty($password)) {
        throw new Exception("Missing required fields.");
    }
    if (!verifyOTP($otp)) {
        throw new Exception("Invalid OTP.");
    }
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $conn->prepare("UPDATE users SET password = :password WHERE email = :email");
    $hashedPassword = hashPassword($password);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':email', $email);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Password reset successfully.']);
    } else {
        throw new Exception("Failed to reset password.");
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn = null; // Close the database connection
    }
}

?>