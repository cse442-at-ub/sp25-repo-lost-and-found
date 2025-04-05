<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer-6.9.3/src/Exception.php';
require 'PHPMailer-6.9.3/src/PHPMailer.php';
require 'PHPMailer-6.9.3/src/SMTP.php';

require_once 'db.php';
require_once 'mailinfo.php';

try {
  // Establish PDO connection
  $pdo = getDbConnection();

  header('Content-Type: application/json');

  // Check if it's a POST request
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data from the request body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Check if email is provided
    if (isset($data['email'])) {
      $email = $data['email'];

      // Prepare and execute the SQL query
      $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
      $stmt->execute([$email]);
      $count = $stmt->fetchColumn();

      if ($count > 0) {
        $otp = sprintf("%06d", rand(0, 999999));
        $hashed = password_hash($otp, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('INSERT INTO otp_tokens
            VALUES (DEFAULT,:email,:token,DEFAULT,DEFAULT)');
        $stmt->bindValue(':email', $email, PDO::PARAM_STR);
        $stmt->bindValue(':token', $hashed, PDO::PARAM_STR);
        $stmt->execute();

        $mail = new PHPMailer(true);
        try {
          //Server settings
          $mail->SMTPDebug = 0; // Enable verbose debug output, change to DEBUG_OFF in production
          $mail->isSMTP(); // Send using SMTP
          $mail->Host       = $mailhost; // Set the SMTP server to send through
          $mail->SMTPAuth   = true; // Enable SMTP authentication
          $mail->SMTPSecure = 'tls'; // Enable implicit TLS encryption
          $mail->Username   = $mailaddr; // SMTP username
          $mail->Password   = $mailpasswd; // SMTP password, use app password for better security
          $mail->Port       = $mailtlsport; // TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

          //Recipients
          $mail->setFrom($mailaddr, 'CSE442 Lost and Found');
          $mail->addAddress($email, 'User');     // Add a recipient

          // Content
          $mail->isHTML(true);                                  // Set email format to HTML
          $mail->Subject = 'Your OTP token to reset password';
          $mail->Body    = "<p>Your OTP token is <code>$otp</code>. It will expire after 10 minutes.</p>";
          $mail->AltBody = "Your OTP token is $otp. It will expire after 10 minutes.";

          $mail->send();
          echo sprintf('{"okay": true, "otp": "%s"}', $otp);
        } catch (Exception $e) {
          echo sprintf('{"okay": true, "otp": "%s", "msg": "%s"}', $otp,
            "Email could not be sent. Mailer Error: {$mail->ErrorInfo}");
        }

        // echo sprintf('{"okay": true, "otp": "%s"}', $otp);
      } else {
        echo '{"okay": false, "msg": "Email not found"}';
      }
    } else {
      echo '{"okay": false, "msg": "Email required"}';
    }
  } else {
    echo '{"okay": false, "msg": "Email not allowed"}';
  }
} catch (PDOException $e) {
  // Handle database errors
  http_response_code(500); // Internal Server Error
  echo "Database error: " . $e->getMessage();
}
?>