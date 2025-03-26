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

// Check if form is submitted and the POST variables are set
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username'], $_POST['password'])) {
    $user_input_username = $_POST['username'];
    $user_input_password = $_POST['password'];

    // SQL query to check if the username exists
    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $user_input_username);
    $stmt->execute();
    $result = $stmt->get_result();

    // If the username exists
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Verify the password
        if (password_verify($user_input_password, $user['password'])) {
            // Password is correct, start a session and redirect to home page
            $_SESSION['user_id'] = $user['id']; // Store user ID
            $_SESSION['username'] = $user['username']; // Store username

            header("Location: \home\home.html");
            exit();

        } else {
            echo "Invalid password!";
        }
    } else {
        echo "No user found with that username!";
    }

    $stmt->close();
} else {
    echo "Please enter both username and password!";
}

$conn->close();
?>
