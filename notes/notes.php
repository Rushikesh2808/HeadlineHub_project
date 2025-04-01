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

// Read request data
$data = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

// Fetch user notes (as a single entry)
if ($action === "fetch") {
    $stmt = $pdo->prepare("SELECT content FROM notes WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $note = $stmt->fetch(PDO::FETCH_ASSOC);

    $notesString = $note ? htmlspecialchars($note['content']) : "";
    
    echo json_encode(["notesString" => $notesString]);
}

// Save or update notes (store as a single entry with § separator)
elseif ($action === "save") {
    if (!isset($data['notesString']) || empty(trim($data['notesString']))) {
        echo json_encode(["error" => "Note cannot be empty"]);
        exit;
    }

    try {
        // Check if a note entry exists for the user
        $stmt = $pdo->prepare("SELECT id FROM notes WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $existingNote = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existingNote) {
            // Update the existing note
            $stmt = $pdo->prepare("UPDATE notes SET content = ? WHERE user_id = ?");
            $stmt->execute([htmlspecialchars($data['notesString']), $_SESSION['user_id']]);
        } else {
            // Insert a new note
            $stmt = $pdo->prepare("INSERT INTO notes (user_id, content) VALUES (?, ?)");
            $stmt->execute([$_SESSION['user_id'], htmlspecialchars($data['notesString'])]);
        }

        echo json_encode(["status" => "saved"]);
    } catch (PDOException $e) {
        error_log("Insert Error: " . $e->getMessage());
        echo json_encode(["error" => "Database insert failed"]);
    }
}

// Invalid action
else {
    echo json_encode(["error" => "Invalid action"]);
}
?>
