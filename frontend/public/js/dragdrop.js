document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // Öffne das Dateiauswahlfenster, wenn die Drop-Zone angeklickt wird
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Verhindere das Standardverhalten von Drag-and-Drop-Events
    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropZone.classList.remove('dragover');

        const files = event.dataTransfer.files;
        handleFiles(files);
    });

    // Dateien werden über das Input-Element ausgewählt
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        handleFiles(files);
    });

    // Verarbeite die Dateien (Upload etc.)
    function handleFiles(files) {
        const formData = new FormData();
        
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }

        // Sende die Dateien an den Server
        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert('Dateien erfolgreich hochgeladen');
            console.log('Upload response:', data);
        })
        .catch(error => {
            alert('Fehler beim Hochladen der Dateien');
            console.error('Error:', error);
        });
    }
});
