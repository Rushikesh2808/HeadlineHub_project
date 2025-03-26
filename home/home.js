document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("resize", () => {
        document.querySelector(".news-container").style.display = "grid";
        
    });
    
    const newsSources = {
        "times-of-india-list": "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
        "the-hindu-list": "https://www.thehindu.com/news/national/feeder/default.rss",
        "economic-times-list": "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
        "sportstar-list": "https://www.thehindu.com/sport/feeder/default.rss",
        "espn-cricinfo-list": "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
        "ndtv-list": "https://feeds.feedburner.com/ndtvnews-top-stories",
        "dainik-bhaskar-list": "https://www.bhaskar.com/rss-v1--category-1061.xml" 
    };

    async function fetchRSSFeed(url, listId) {
        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();
    
            console.log(`Fetched Data for ${listId}:`, data); // Debugging
    
            const parser = new DOMParser();
            const xml = parser.parseFromString(data.contents, "text/xml");
            const items = xml.querySelectorAll("item");
            const newsList = document.getElementById(listId);
            newsList.innerHTML = "";
    
            if (items.length === 0) {
                console.warn(`No news found for ${listId}`);
            }
    
            items.forEach((item, index) => {
                if (index < 15) { 
                    const title = item.querySelector("title")?.textContent || "No title";
                    const description = item.querySelector("description")?.textContent || "No description available.";
                    const link = item.querySelector("link")?.textContent.trim() || "#";
    
                    console.log("Extracted link:", link);
    
                    let imageUrl = "";
                    const enclosure = item.querySelector("enclosure");
                    if (enclosure && enclosure.getAttribute("url")) {
                        imageUrl = enclosure.getAttribute("url");
                    } else {
                        const imgMatch = description.match(/<img.*?src=["'](.*?)["']/);
                        if (imgMatch) imageUrl = imgMatch[1];
                    }
    
                    const listItem = document.createElement("li");
                    listItem.textContent = title;
                    listItem.setAttribute("data-description", description);
                    listItem.setAttribute("data-link", link);
                    if (imageUrl) listItem.setAttribute("data-image", imageUrl);
    
                    newsList.appendChild(listItem);
                }
            });
        } catch (error) {
            console.error(`Error fetching news from ${url}:`, error);
        }
    }
    

    for (const [listId, url] of Object.entries(newsSources)) {
        fetchRSSFeed(url, listId);
    }

    document.body.insertAdjacentHTML("beforeend", `
        <div id="news-popup" class="modal">
         <div class="modal-content">
             <span class="close-btn">&times;</span>
             <h2 id="popup-title"></h2> 
             <h3 id="popup-headline"></h3> 
             
             <p id="popup-description"></p> 
             <a id="popup-link" href="#" target="_blank">
                 <button class="visit-site">Visit Website</button> 
             </a>
             <button class="ss-btn">Save article</button>
             <div class="pagination-buttons">
                 <button id="prev-btn">←</button>
                 <button id="next-btn">→</button>
             </div>
         </div>
     </div>
     `);
     document.querySelector(".ss-btn").addEventListener("click", function () {
        let popup = document.querySelector(".modal-content"); // Selects the popup content
        if (!popup) {
            console.error("Popup element not found!");
            return;
        }

        html2canvas(popup, { useCORS: true }).then(function (canvas) {
            let image = canvas.toDataURL("image/png");
            let link = document.createElement("a");
            link.href = image;
            link.download = "popSs.png";
            link.click();
        });
    });
    const modal = document.getElementById("news-popup");
    const modalHeadline = document.getElementById("popup-headline");
    const modalDescription = document.getElementById("popup-description");
    const modalImage = document.getElementById("popup-image");
    const closeButton = document.querySelector(".close-btn");
    const prevButton = document.getElementById("prev-btn");
    const nextButton = document.getElementById("next-btn");
    const modalLink = document.getElementById("popup-link");

    let headlines = [];
    let descriptions = [];
    let images = [];
    let links = [];
    let currentIndex = 0;

    // Function to open the news popup
    function openPopup(newsBox) {
        modal.classList.add("show");
        modal.style.display = "flex";
    
        headlines = [];
        descriptions = [];
        images = [];
        links = [];
        currentIndex = 0;
    
        newsBox.querySelectorAll("li").forEach((item) => {
            headlines.push(item.textContent);
            descriptions.push(item.getAttribute("data-description") || "No description available.");
            images.push(item.getAttribute("data-image") || ""); 
            links.push(item.getAttribute("data-link") || "#");
        });

        console.log("Stored links:", links);

        if (headlines.length > 0) {
            updatePopup();
        }
    }


    function updatePopup() {
        modalHeadline.textContent = headlines[currentIndex];
        modalDescription.textContent = descriptions[currentIndex];
    
        const imageUrl = images[currentIndex];
        if (imageUrl) {
            modalImage.src = imageUrl;
            modalImage.style.display = "block";
        } else {
            modalImage.style.display = "none";
        }
    
        // ✅ Ensure the link is correctly assigned
        const currentLink = links[currentIndex]?.trim();
        if (currentLink && currentLink.startsWith("http")) {
            modalLink.href = currentLink;
            modalLink.target = "_blank";
            modalLink.rel = "noopener noreferrer";
        } else {
            modalLink.removeAttribute("href");  // Prevents invalid redirection
            alert("No valid link available for this article.");
        }
    
        prevButton.style.display = currentIndex > 0 ? "block" : "none";
        nextButton.style.display = currentIndex < headlines.length - 1 ? "block" : "none";
    }
    

    prevButton.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updatePopup();
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentIndex < headlines.length - 1) {
            currentIndex++;
            updatePopup();
        }
    });

    function closePopup() {
        const modalContent = document.querySelector(".modal-content");
        const modal = document.getElementById("news-popup");
    
        const rect = modalContent.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const top = rect.top + window.scrollY;
        const left = rect.left + window.scrollX;
    
        let pieces = [];
        for (let i = 0; i < 16; i++) {
            let piece = document.createElement("div");
            piece.classList.add("shatter-piece");

            let row = Math.floor(i / 4);
            let col = i % 4;
            piece.style.width = `${width / 4}px`;
            piece.style.height = `${height / 4}px`;
            piece.style.left = `${left + (width / 4) * col}px`;
            piece.style.top = `${top + (height / 4) * row}px`;

            const randomTexts = ["NEWS", "HOT", "TREND", "UPDATE", "BREAKING", "ALERT", "WORLD", "HEADLINE"];
            piece.textContent = randomTexts[Math.floor(Math.random() * randomTexts.length)];

            document.body.appendChild(piece);
            pieces.push(piece);
        }
    
        modalContent.style.opacity = "0"; 
    
        setTimeout(() => {
            pieces.forEach(piece => {
                let randomX = (Math.random() - 0.5) * 200;
                let randomY = Math.random() * -100;
                let randomRotate = Math.random() * 360;

                piece.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`; 
                piece.style.opacity = "0";
            });
        }, 100);
    
        setTimeout(() => {
            modal.style.display = "none";
            pieces.forEach(piece => piece.remove());
            modalContent.style.opacity = "1";
        }, 700);
    }

    closeButton.addEventListener("click", closePopup);
    
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    document.querySelectorAll(".news-box").forEach(box => {
        box.addEventListener("click", () => openPopup(box));
    });


     // Real-time search
     const searchInput = document.querySelector(".news-input");

     if (searchInput) {
         searchInput.addEventListener("input", () => {
             const query = searchInput.value.trim().toLowerCase();
             const allLists = document.querySelectorAll(".news-box ul");
     
             allLists.forEach(list => {
                 list.querySelectorAll("li").forEach(item => {
                     const title = item.textContent.toLowerCase();
                     const description = item.getAttribute("data-description")?.toLowerCase() || "";
     
                     if (title.includes(query) || description.includes(query)) {
                         item.style.display = "block"; 
                         item.innerHTML = highlightText(item.textContent, query); 
                     } else {
                         item.style.display = "none"; 
                     }
                 });
             });
         });
     }
     function highlightText(text, query) {
        if (!query) return text; 
        const regex = new RegExp(`(${query})`, "gi"); 
        return text.replace(regex, '<span class="highlight">$1</span>'); 
    }
    // screenshot
    document.getElementById("screenshot-btn").addEventListener("click", function () {
        html2canvas(document.body).then(function (canvas) {
            let image = canvas.toDataURL("image/png");
            let link = document.createElement("a");
            link.href = image;
            link.download = "HHScreenshot.png";
            link.click();
        });
    });

    function logout(event) {
        event.preventDefault();
    
        fetch("logout.php", { credentials: "include" })  // Ensure session cookies are included
            .then(response => {
                sessionStorage.clear();
                localStorage.clear();
                window.location.href = "\login\index.html"; // Redirect after logout
            })
            .catch(error => console.error("Logout failed:", error));
    }
    
    document.querySelector(".visit-site").addEventListener("click", function (event) {
        event.preventDefault();
    
        const currentLink = links[currentIndex]?.trim();
        console.log("Redirecting to:", currentLink); // Debugging output
    
        if (currentLink && currentLink.startsWith("http")) {
            window.open(currentLink, "_blank");
        } else {
            alert("No valid link available.");
        }
    });    
    
    
});
