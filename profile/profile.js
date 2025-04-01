document.addEventListener("DOMContentLoaded", function () {
    fetchProfile();
document.getElementById("editForm").classList.add("hidden");
document.getElementById("changePasswordForm").classList.add("hidden");

    document.getElementById("editButton").addEventListener("click", function () {
        document.getElementById("editForm").classList.toggle("hidden");
        document.getElementById("changePasswordForm").classList.toggle("hidden");
    });
});

function fetchProfile() {
    fetch("profile.php?action=fetch")
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            document.getElementById("username").textContent = data.username;
            document.getElementById("email").textContent = data.email;
            document.getElementById("newUsername").value = data.username;
            document.getElementById("newEmail").value = data.email;
        })
        .catch(error => console.error("Error fetching profile:", error));
}

function updateProfile() {
    const newUsername = document.getElementById("newUsername").value.trim();
    const newEmail = document.getElementById("newEmail").value.trim();

    if (!newUsername || !newEmail) {
        alert("Username and email cannot be empty.");
        return;
    }

    fetch("profile.php?action=update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, email: newEmail })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert("Profile updated successfully!");
                fetchProfile(); 
            }
        })
        .catch(error => console.error("Error updating profile:", error));
}

function updatePassword() {
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("All fields are required.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match.");
        return;
    }

    fetch("profile.php?action=changePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "updated") {
            alert("Password updated successfully.");
            document.getElementById("changePasswordForm").classList.add("hidden");
        } else {
            alert(data.error);
        }
    });
}
