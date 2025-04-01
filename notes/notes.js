// Load notes from the database on page load
window.onload = function () {
    fetchNotes();
};

// Fetch notes from the database
function fetchNotes() {
    fetch("notes.php?action=fetch")
        .then(response => response.json())
        .then(data => {
            const notesContainer = document.getElementById("notesContainer");
            notesContainer.innerHTML = "";

            if (!data.notesString) return;  // If no notes, exit early

            const notesArray = data.notesString.split("§"); // Split notes using "§"

            notesArray.forEach(noteContent => {
                const newNote = createNoteElement(null, noteContent.trim());
                notesContainer.appendChild(newNote);
            });
        })
        .catch(error => console.error("Error fetching notes:", error));
}

// Create an editable note element
function createNoteElement(id = null, content = "Click to edit...") {
    const note = document.createElement("div");
    note.classList.add("note");
    note.contentEditable = true;
    note.dataset.id = id;

    note.innerHTML = `${content} <span class="delete-btn" onclick="removeNote(this)">x</span>`;
    return note;
}

// Add a new note (without saving)
function addNote() {
    const notesContainer = document.getElementById("notesContainer");
    const newNote = createNoteElement();
    notesContainer.appendChild(newNote);
}

// Save all notes to the database
function saveNotes() {
    const notes = document.querySelectorAll(".note");
    const notesData = [];

    notes.forEach(note => {
        const content = note.textContent.replace("x", "").trim();
        if (content) {
            notesData.push(content);
        }
    });

    if (notesData.length === 0) {
        alert("Note cannot be empty!");
        return;
    }

    const notesString = notesData.join(" § "); // Join notes with separator "§"

    fetch("notes.php?action=save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notesString }) // Send combined notes
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "saved") {
            alert("Notes saved successfully!");
            fetchNotes(); // Refresh notes
        } else if (data.error) {
            alert(data.error);
        }
    })
    .catch(error => console.error("Error saving notes:", error));
}

// Remove a note
function removeNote(element) {
    element.parentElement.remove();
}
