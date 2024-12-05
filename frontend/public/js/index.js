document.addEventListener('DOMContentLoaded', () => {
    fetchPenalties();

    // Aktualisiere die Striche alle 1 Sekunde
    setInterval(fetchPenalties, 1000);

    async function fetchPenalties() {
        try {
            const response = await fetch('/api/penalties');
            const data = await response.json();
    
            // Sortiere die Daten absteigend nach der Anzahl der Striche
            data.sort((a, b) => b.strikes - a.strikes);
            const tableBody = document.getElementById('penaltiesTable');
            tableBody.innerHTML = '';
    
            // Finde die höchste Anzahl an Strichen
            const maxStrikes = data.length > 0 ? data[0].strikes : 0;
    
            data.forEach(user => {
                const row = document.createElement('tr');
    
                // Überprüfe, ob der Benutzer die höchste Anzahl an Strichen hat
                const crownIcon = user.strikes === maxStrikes && maxStrikes > 0
                    ? `<img src="images/crown.png" alt="Krone" class="crown-icon">`
                    : '';
    
                row.innerHTML = `
                    <td class="name-column">${crownIcon} ${user.name}</td>
                    <td class="strikes-column">${formatStrikes(user.strikes, user.name, user.blockColor, user.reasons)}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Fehler beim Laden der Striche:', error);
        }
    }
    

    // Hilfsfunktion zum Formatieren des Datums in TT.MM.JJJJ
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    function formatStrikes(strikes, userName, blockColor = {}, reasons = []) {
        let result = '';
        const fullBlocks = Math.floor(strikes / 5);
        const remainingStrikes = strikes % 5;

        for (let i = 1; i <= fullBlocks * 5; i++) {
            const blockIndex = Math.ceil(i / 5);
            const color = blockColor[blockIndex] === 'white' ? 'white' : '#5a62d7';

            const blockReasons = reasons.slice((blockIndex - 1) * 5, blockIndex * 5);
            // Formatierung für das Datum
            const reasonText = blockReasons.map(r => `${formatDate(r.date)}: ${r.text}`).join(', '); // "Datum: Begründung"

            if (i % 5 === 1) {
                result += `<span class="strikethrough-diagonal strike-block" data-user="${userName}" data-reasons="${reasonText}" data-index="${blockIndex}" style="color: ${color};">`;
            }
            if (i % 5 !== 0) {
                result += '|';
            }
            if (i % 5 === 0) {
                result += '</span> ';
            }
        }

        for (let i = 1; i <= remainingStrikes; i++) {
            const remainingReasons = reasons.slice(fullBlocks * 5).map(r => `${formatDate(r.date)}: ${r.text}`).join(', ');
            result += `<span class="strike" data-user="${userName}" data-reasons="${remainingReasons}" data-index="${fullBlocks + 1}">|</span>`;
        }

        return result;
    }
    

    // Event-Listener für das Öffnen des Modals mit spezifischen Begründungen und Dateien für den Block
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('strike') || event.target.classList.contains('strikethrough-diagonal')) {
            const reasons = event.target.getAttribute('data-reasons');
            const userName = event.target.getAttribute('data-user');
            const blockIndex = event.target.getAttribute('data-index');
            showReasonModal(reasons, userName, blockIndex); // Öffnet das Modal mit den Begründungen für den spezifischen Block
        }
    });

    function showReasonModal(reasons, userName, blockIndex) {
        const reasonList = document.getElementById('reasonList');
        reasonList.innerHTML = ''; // Leere die Liste vorher

        fetch(`/api/penalties/reasons?name=${userName}`)
        .then(response => response.json())
        .then(allReasons => {
            const blockStart = (blockIndex - 1) * 5; // Startindex des Blocks
            const blockEnd = blockStart + 5;         // Endindex des Blocks

            // Filtere die Begründungen für den aktuellen 5er-Block
            const filteredReasons = allReasons.slice(blockStart, blockEnd);

            // Anzeige der gefilterten Begründungen mit Datum
            filteredReasons.forEach(reasonObj => {
                const listItem = document.createElement('li');
                listItem.textContent = `${reasonObj.date}: ${reasonObj.text}`;
                reasonList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Fehler beim Abrufen der Begründungen:', error));

        // Hole und zeige die Datei für den spezifischen Block
        fetch(`/api/penalties/files?user=${userName}`)
            .then(response => response.json())
            .then(files => {
                const filePreview = document.getElementById('filePreview');
                filePreview.innerHTML = ''; // Leere die vorherige Dateivorschau

                // Zeige nur die Datei für den aktuellen Block an
                const file = files[blockIndex - 1];
                if (file) {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';

                    // Vorschau-Container
                    const filePreviewDiv = document.createElement('div');
                    filePreviewDiv.className = 'file-preview';

                    // Überprüfe den Dateityp und zeige die Vorschau oder ein Standard-Icon
                    const extension = file.name.split('.').pop().toLowerCase();
                    if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
                        const imgPreview = document.createElement('img');
                        imgPreview.src = `/uploads/${userName}/${file.name}`;
                        imgPreview.alt = 'Image Preview';
                        imgPreview.className = 'preview-image';
                        filePreviewDiv.appendChild(imgPreview);
                    } else {
                        const defaultIcon = document.createElement('div');
                        defaultIcon.textContent = extension.toUpperCase();
                        filePreviewDiv.appendChild(defaultIcon);
                    }

                    fileItem.appendChild(filePreviewDiv);

                    const fileName = document.createElement('div');
                    fileName.className = 'file-name';
                    fileName.textContent = file.name.replace(/\.[^/.]+$/, ""); // Dateiname ohne Endung
                    fileItem.appendChild(fileName);

                    fileItem.addEventListener('click', () => {
                        window.open(`/uploads/${userName}/${file.name}`, '_blank'); // Datei in neuem Tab öffnen
                    });

                    filePreview.appendChild(fileItem);
                }
            })
            .catch(error => console.error('Fehler beim Laden der Dateien:', error));

        // Modal anzeigen
        const modal = document.getElementById('reasonModal');
        modal.style.display = 'block';
    }

    function closeReasonModal() {
        document.getElementById('reasonModal').style.display = 'none';
    }

    const closeModal = document.getElementsByClassName("close")[0];
    closeModal.onclick = closeReasonModal;

    window.onclick = function(event) {
        const modal = document.getElementById('reasonModal');
        if (event.target === modal) {
            closeReasonModal();
        }
    };
});
