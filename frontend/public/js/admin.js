// admin.js

// Funktion zur Darstellung der Striche in 4 vertikale Striche + 1 Querstrich
function formatStrikes(strikes, userName, blockColor = {}) {
    let result = '';
    const fullBlocks = Math.floor(strikes / 5); // Anzahl der vollständigen Blöcke
    const remainingStrikes = strikes % 5;       // Verbleibende Striche außerhalb eines vollständigen Blocks

    for (let i = 1; i <= fullBlocks * 5; i++) {
        const blockIndex = Math.ceil(i / 5);
        const color = blockColor[blockIndex] === 'white' ? 'white' : '#5a62d7'; // Gelb oder Weiß
        if (i % 5 === 1) {
            result += `<span class="strikethrough-diagonal strike-block" data-user="${userName}" data-index="${blockIndex}" style="color: ${color};">`;
        }
        if (i % 5 !== 0) {
            result += '|';
        }
        if (i % 5 === 0) {
            result += '</span> ';
        }
    }

    for (let i = 1; i <= remainingStrikes; i++) {
        result += '<span class="strike">|</span>';
    }

    return result;
}

// Funktion zur Überprüfung der Session basierend auf dem Cookie
async function checkSession() {
    try {
        const response = await fetch('/api/auth/check-session'); // Der Server überprüft die Session anhand des Cookies
        if (response.ok) {
            // Session gültig, ruft die Strichdaten erneut ab
            fetchPenalties();
        } else {
            console.log('Session ungültig, leitet zur Login-Seite weiter...');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Fehler beim Überprüfen der Session:', error);
        window.location.href = '/login.html'; // Bei Fehler leitet ebenfalls zur Login-Seite weiter
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkSession(); // Überprüfe sofort, ob die Session vorhanden und gültig ist

    // Event Listener für den Button "Benutzer hinzufügen"
    document.getElementById('addUserButton').addEventListener('click', addUser);

    // Überprüfe die Session und aktualisiere die Striche jede Sekunde
    setInterval(checkSession, 1000); // Alle 1000 ms (1 Sekunde)
});

// Funktion zum Abrufen der Striche
async function fetchPenalties() {
    try {
        const response = await fetch('/api/penalties'); // Session-Cookie wird automatisch mitgesendet

        if (!response.ok) {
            console.error('Session ungültig, leite zur Login-Seite weiter.');
            window.location.href = '/login.html';
            return;
        }

        const data = await response.json();
        const tableBody = document.getElementById('penaltiesTable');

        // Lösche alten Inhalt der Tabelle
        tableBody.innerHTML = '';

        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${formatStrikes(user.strikes, user.name, user.blockColor)}</td>
                <td>
                    <button onclick="promptReason('${user.name}')">Strich hinzufügen</button>
                </td>
                <td>
                    <button onclick="showReasons('${user.name}')">Begründungen anzeigen</button>
                </td>
                <td>${createDragDropZone(user.name)}</td>
                <td><button class="show-files-btn" onclick="showFiles('${user.name}')">Dateien anzeigen</button></td>
            `;
            tableBody.appendChild(row);

            // Setup für Drag-and-Drop-Events
            const dropZone = document.querySelector(`.drop-zone[data-user="${user.name}"]`);
            const fileInput = document.getElementById(`fileInput-${user.name}`);
            setupDragDropEvents(dropZone, fileInput, user.name);
        });

        // Event Listener für Klick auf 5er-Blöcke hinzufügen
        document.querySelectorAll('.strike-block').forEach(block => {
            block.addEventListener('click', () => {
                const userName = block.getAttribute('data-user');
                const index = block.getAttribute('data-index');
                if (block.style.color !== 'white') {
                    changeBlockColor(block, userName, index);
                }
            });
        });

    } catch (error) {
        console.error('Fehler beim Laden der Striche:', error);
    }
}


function promptReason(userName) {
    // Fordere den Benutzer zur Eingabe der Begründung auf
    const reason = prompt('Bitte geben Sie eine Begründung ein:');
    if (!reason) {
        alert("Keine Begründung eingegeben. Der Strich wurde nicht hinzugefügt.");
        return;
    }

    // Fordere den Benutzer zur Eingabe des Datums auf
    let date = prompt('Bitte geben Sie das Datum im Format TT.MM.JJJJ oder T.M.JJJJ ein:', new Date().toLocaleDateString('de-DE'));

    // Wenn der Benutzer kein Datum eingibt, breche den Vorgang ab
    if (!date) {
        alert("Kein Datum eingegeben. Der Strich wurde nicht hinzugefügt.");
        return;
    }

    // Überprüfen, ob das Datum im Format TT.MM.JJJJ oder T.M.JJJJ ist
    const datePattern = /^\d{1,2}\.\d{1,2}\.\d{4}$/;
    if (!datePattern.test(date)) {
        alert("Falsches Datumsformat. Bitte das Datum im Format TT.MM.JJJJ oder T.M.JJJJ eingeben.");
        return;
    }

    // Formatierung des Datums auf TT.MM.JJJJ sicherstellen
    const [day, month, year] = date.split('.');
    const formattedDate = `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`; // Hier wird das Datum richtig formatiert

    // Übergib das formatierte Datum und die Begründung an die addStrike-Funktion
    addStrike(userName, reason, formattedDate);
}

// Funktion zum Hinzufügen des Striches mit Datum und Begründung
async function addStrike(userName, reason, date) {
    try {
        const response = await fetch('/api/penalties/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: userName, reason: reason, date: date }) // Verwende das bereits formatierte Datum
        });

        if (response.ok) {
            fetchPenalties(); // Aktualisiere die Anzeige der Striche
        } else {
            alert('Fehler beim Hinzufügen eines Striches.');
        }
    } catch (error) {
        console.error('Fehler beim Hinzufügen eines Striches:', error);
    }
}


// Funktion zur Änderung der Blockfarbe und Speicherung auf dem Server
async function changeBlockColor(block, userName, index) {
    block.style.color = 'white'; // Setze die Farbe auf weiß

    try {
        const response = await fetch('/api/penalties/updateColor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: userName, blockIndex: index })
        });

        if (!response.ok) {
            console.error('Fehler beim Aktualisieren der Blockfarbe');
        }
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Blockfarbe:', error);
    }
}

// Funktion zur Anzeige der hochgeladenen Dateien mit Session-Überprüfung
async function showFiles(userName) {
    try {
        const response = await fetch('/api/auth/check-session'); // Überprüft die Session

        if (!response.ok) {
            console.log('Ungültige Session, leite zur Login-Seite weiter.');
            window.location.href = '/login.html';
            return;
        }

        // Wenn die Session gültig ist, zeige die Dateien an
        window.location.href = `filedata?user=${userName}`; // Weiterleitung zur neuen Seite

    } catch (error) {
        console.error('Fehler beim Überprüfen der Session:', error);
        window.location.href = '/login.html'; // Bei Fehler leitet ebenfalls zur Login-Seite weiter
    }
}

function showReasons(userName) {
    const reasonList = document.getElementById('reasonList');
    reasonList.innerHTML = ''; // Leere die Liste vorher

    // Hole die Begründungen mit Datum vom Server
    fetch(`/api/penalties/reasons?name=${userName}`)
        .then(response => response.json())
        .then(reasons => {
            reasons.forEach(reasonObj => {
                const listItem = document.createElement('li');
                
                // Formatierung des Datums
                const formattedDate = formatDate(reasonObj.date); // Hier wird das Datum formatiert

                // Zeige das Datum und die Begründung in der gewünschten Form an
                listItem.textContent = `${reasonObj.date}: ${reasonObj.text}`; // Format: "Datum: Begründung"
                
                reasonList.appendChild(listItem);
            });

            // Modal anzeigen
            const modal = document.getElementById('reasonModal');
            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Begründungen:', error);
        });

    // Modal-Schließlogik
    const closeModal = document.getElementsByClassName("close")[0];
    closeModal.onclick = function() {
        const modal = document.getElementById('reasonModal');
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        const modal = document.getElementById('reasonModal');
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
}



// Hilfsfunktion zum Formatieren des Datums in TT.MM.JJJJ
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Tag im Format 2-stellig
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Monat im Format 2-stellig (Monate sind 0-basiert)
    const year = date.getFullYear(); // Jahr
    return `${day}.${month}.${year}`; // Gibt das Datum im Format dd.mm.yyyy zurück
}






// Funktion zur Erstellung von Drag-and-Drop und Dateianzeige-Buttons
function createDragDropZone(userName) {
    return `
        <div class="drop-zone" data-user="${userName}">
            <p>Datei hochladen</p>
            <input type="file" id="fileInput-${userName}" multiple style="display: none;">
        </div>
    `;
}

// Funktion zum Setup von Drag-and-Drop-Events
function setupDragDropEvents(dropZone, fileInput, userName) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(event.dataTransfer.files, userName);
    });

    fileInput.addEventListener('change', (event) => {
        handleFiles(event.target.files, userName);
    });
}

// Funktion zur Verarbeitung von Dateien und Upload
async function handleFiles(files, userName) {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files[]', file));

    try {
        // Sende die Dateien an den Server für den physischen Upload
        const response = await fetch(`/api/upload?user=${userName}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            console.error('Upload-Fehler:', response.statusText);
            alert('Fehler beim Hochladen der Dateien.');
            return;
        }

        // Überprüfen der Antwortstruktur
        const result = await response.json();
        console.log('Antwort von /api/upload:', result);

        // Extrahiere das `files`-Array aus dem `result`-Objekt
        const uploadedFiles = result.files;
        
        if (!Array.isArray(uploadedFiles)) {
            console.error('Unerwartete Antwortstruktur für files:', uploadedFiles);
            alert('Fehler beim Hochladen der Dateien.');
            return;
        }

        // Metadaten der hochgeladenen Dateien in `userData.json` speichern
        const metadataPromises = uploadedFiles.map(file => {
            console.log(`Speichere Datei-Metadaten für ${file.filename}`);
            return fetch('/api/penalties/addFile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userName,
                    filename: file.filename,
                    uploadDate: new Date().toISOString()
                })
            });
        });

        // Warte auf den Abschluss aller Metadaten-Speicheranfragen
        const metadataResponses = await Promise.all(metadataPromises);
        const allSuccessful = metadataResponses.every(res => res.ok);

        if (allSuccessful) {
            alert(`Dateien erfolgreich hochgeladen für ${userName}`);
            fetchPenalties(); // Aktualisiere die Anzeige der Striche und Dateien
        } else {
            console.error('Fehler beim Speichern der Datei-Metadaten.');
            alert('Fehler beim Speichern der Datei-Metadaten.');
        }
    } catch (error) {
        console.error('Fehler beim Hochladen der Dateien:', error);
        alert('Fehler beim Hochladen der Dateien');
    }
}




// Funktion zum Schließen des Begründungsmodals
function closeReasonModal() {
    document.getElementById('reasonModal').style.display = 'none';
}

// Funktion zum Hinzufügen eines neuen Benutzers
async function addUser() {
    const userName = prompt('Bitte geben Sie den Vorname und Nachname ein ein:');
    if (userName) {
        try {
            const response = await fetch('/api/penalties/addUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: userName }) // Benutzername in der Anfrage
            });

            if (response.ok) {
                alert('Benutzer erfolgreich hinzugefügt');
                fetchPenalties(); // Aktualisiere die Benutzerliste
            } else {
                const errorData = await response.json();
                alert('Fehler beim Hinzufügen des Benutzers: ' + errorData.message);
            }
        } catch (error) {
            console.error('Fehler beim Hinzufügen des Benutzers:', error);
        }
    }
}

// admin.js
async function logout() {
    console.log("Logout-Funktion aufgerufen"); // Log zur Bestätigung
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        if (response.ok) {
            console.log("Logout erfolgreich, leite zur gewünschten Seite weiter");
            window.location.href = '/login.html';  // Hier die gewünschte Seite eintragen
        } else {
            console.error("Logout fehlgeschlagen:", response.statusText);
        }
    } catch (error) {
        console.error('Fehler beim Ausloggen:', error);
    }
}
