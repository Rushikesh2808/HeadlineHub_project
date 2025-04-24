<?php
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

// Check if token is provided in the URL
if (isset($_GET['token'])) {
    $reset_token = $_GET['token'];

    // SQL query to check if the token exists and is valid
    $sql = "SELECT * FROM users WHERE reset_token = ? AND token_expiry > NOW()";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $reset_token);
    $stmt->execute();
    $result = $stmt->get_result();

    // If the token is valid
    if ($result->num_rows > 0) {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
            $new_password = $_POST['password'];
            $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

            // Update the password in the database
            $sql = "UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE reset_token = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $hashed_password, $reset_token);
            $stmt->execute();

            echo "Your password has been successfully reset!";
        } else {
            ?>
            <!-- HTML form to enter the new password -->
            <form action="reset-password.php?token=<?php echo $reset_token; ?>" method="POST">
                <h1>Reset Password</h1>
                <div class="input-box">
                    <input type="password" name="password" placeholder="Enter new password" required>
                </div>
                <button type="submit" class="btn">Reset Password</button>
            </form>
            <?php
        }
    } else {
        echo "Invalid or expired token!";
    }

    $stmt->close();
} else {
    echo "Invalid request!";
}

$conn->close();
?>
