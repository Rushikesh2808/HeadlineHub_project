function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission
  
    // Get username, password, and "Remember Me" checkbox values
    const username = event.target[0].value; // First input (username)
    const password = event.target[1].value; // Second input (password)
    const rememberMe = event.target[2].checked; // Checkbox (Remember Me)

    // Sending the credentials to the server for validation
    fetch('login.php', {
        method: 'POST',
        body: JSON.stringify({ username: username, password: password }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())  // Parse the response as JSON
    .then(data => {
        if (data.success) {
            // Store username if "Remember Me" is checked, else clear it
            if (rememberMe) {
                localStorage.setItem("username", username);
                localStorage.setItem("rememberMe", "true");
            } else {
                localStorage.removeItem("username");
                localStorage.removeItem("rememberMe");
            }

            // Redirect to home page on successful login
            window.location.href = "\home\home.html"; // Change this to your actual home page URL
        } else {
            // Display an error message
            alert(data.message || "Invalid username or password. Please try again.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error processing your login.');
    });
}

// Toggle password visibility
function togglePass() {
    var x = document.getElementById("password");
    x.type = (x.type === "password") ? "text" : "password";
}
