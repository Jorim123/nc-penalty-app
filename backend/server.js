// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = require('./app'); // Importiere die app.js

const PORT = process.env.PORT || 3000;

// Starte den Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startMonitoring(); // Starte die Überwachung der Benutzerordner
});

// Pfad zur userData.json Datei
const dataPath = path.join(__dirname, 'data/userData.json');

// Pfad zum Upload-Verzeichnis
const uploadsPath = path.join(__dirname, 'uploads');

// Funktion zum Lesen der JSON-Datei
function readUserData() {
    if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(data);
    } else {
        console.error('userData.json nicht gefunden.');
        return null;
    }
}

// Funktion zur Überprüfung und Erstellung von Benutzerordnern im Upload-Verzeichnis
function checkAndCreateUserFolders() {
    const data = readUserData();
    if (!data || !data.users) {
        console.error('Keine Benutzer gefunden.');
        return;
    }

    data.users.forEach(user => {
        const userFolder = path.join(uploadsPath, user.username);

        // Überprüfe, ob der Ordner für den Benutzer existiert, wenn nicht, erstelle ihn
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
            console.log(`Ordner für Benutzer '${user.username}' wurde erstellt.`);
        }
    });
}

// Funktion zur regelmäßigen Überprüfung alle 10 Sekunden
function startMonitoring() {
    console.log('Starte Überwachung der Benutzerordner...');
    setInterval(checkAndCreateUserFolders, 10000); // Überprüfe alle 10 Sekunden
}
