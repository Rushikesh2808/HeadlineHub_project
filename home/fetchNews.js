document.addEventListener("DOMContentLoaded", function () {
    fetchNews();
});

function fetchNews() {
    fetch("fetch_news.php") // Ensure this path is correct
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                localStorage.setItem("newsData", JSON.stringify(data)); // Store fetched news
            }
        })
        .catch(error => console.error("Error fetching news:", error));
}
