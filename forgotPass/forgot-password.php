<?php
require 'vendor/autoload.php'; // This loads the Composer autoloader

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

session_start();

$servername = "localhost";
$username = "root";
$password = "Rushi@2808";
$dbname = "headline_hub";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if form is submitted and email is provided
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email'])) {
    $user_email = $_POST['email'];

    // SQL query to check if the email exists
    $sql = "SELECT * FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);

    // Check if the prepare statement failed
    if (!$stmt) {
        die("SQL error: " . $conn->error); // Display the actual MySQL error
    }

    $stmt->bind_param("s", $user_email);
    $stmt->execute();
    $result = $stmt->get_result();

    // If the email exists
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Generate a password reset token
        $reset_token = bin2hex(random_bytes(16)); // 32-character token
        $expiry = date("Y-m-d H:i:s", strtotime('+1 hour')); // Token expiry time (1 hour)

        // Hash the reset token before saving (for security)
        $hashed_token = password_hash($reset_token, PASSWORD_DEFAULT);

        // Store the hashed token and expiry time in the database
        $sql = "UPDATE users SET reset_token = ?, token_expiry = ? WHERE email = ?";
        $stmt = $conn->prepare($sql);

        // Check if the prepare statement failed
        if (!$stmt) {
            die("SQL error: " . $conn->error); // Display the actual MySQL error
        }

        $stmt->bind_param("sss", $hashed_token, $expiry, $user_email);
        $stmt->execute();

        // Send the reset email using PHPMailer with Mailtrap credentials
        sendResetEmail($user_email, $reset_token);
    } else {
        echo "No user found with that email!";
    }

    $stmt->close();
} else {
    echo "Please enter your email!";
}

$conn->close();

// Function to send the password reset email
function sendResetEmail($email, $reset_token) {
    $mail = new PHPMailer(true);
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'sandbox.smtp.mailtrap.io';  // Mailtrap SMTP host
        $mail->SMTPAuth = true;
        $mail->Username = '74c36f14c599bf';  // Mailtrap username
        $mail->Password = '8d6ea09d4f0425';  // Mailtrap password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Recipients
        $mail->setFrom('no-reply@headlinehub.com', 'Headline Hub');
        $mail->addAddress($email);  // Recipient's email address

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Password Reset Request';
        $mail->Body    = 'Click the link below to reset your password: <br> 
                          <a href="http://localhost/HeadlineHub/reset-password.php?token=' . $reset_token . '">Reset Password</a>';

        // Send the email
        $mail->send();
        echo 'A password reset link has been sent to your email.';
    } catch (Exception $e) {
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
}
?>
