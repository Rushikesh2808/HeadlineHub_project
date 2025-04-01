<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

// Database connection
$servername = "localhost";
$username = "root";
$password = "Rushi@2808";
$dbname = "headline_hub";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$action = $_GET['action'] ?? '';

// Fetch user profile
if ($action === "fetch") {
    $stmt = $pdo->prepare("SELECT username, email FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode($user);
    } else {
        echo json_encode(["error" => "User not found"]);
    }
}

// Update user details
elseif ($action === "update") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['username'], $data['email']) || empty(trim($data['username'])) || empty(trim($data['email']))) {
        echo json_encode(["error" => "Username and email cannot be empty"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
    $stmt->execute([$data['username'], $data['email'], $_SESSION['user_id']]);

    echo json_encode(["status" => "updated"]);
}
elseif ($action === "changePassword") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['currentPassword'], $data['newPassword']) || empty($data['currentPassword']) || empty($data['newPassword'])) {
        echo json_encode(["error" => "All fields are required"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($data['currentPassword'], $user['password'])) {
        echo json_encode(["error" => "Current password is incorrect"]);
        exit;
    }

    $hashedPassword = password_hash($data['newPassword'], PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, $_SESSION['user_id']]);

    echo json_encode(["status" => "updated"]);
}


// Invalid action
else {
    echo json_encode(["error" => "Invalid action"]);
}
?>
