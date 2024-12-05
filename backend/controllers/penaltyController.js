const fs = require('fs');
const path = require('path');

// Pfad zur JSON-Datei mit den Strichen
const dataPath = path.join(__dirname, '../data/userData.json');

// Hilfsfunktion zum Lesen der JSON-Datei
function readData() {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
}

// Hilfsfunktion zum Schreiben in die JSON-Datei
function writeData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Funktion zum Abrufen der Striche
async function getPenalties(req, res) {
    const data = readData();
    res.json(data.penalties);
}

// Funktion zum Hinzufügen eines Striches
async function addStrike(req, res) {
    const { name, reason } = req.body; // Hole die Begründung
    const data = readData();
    
    const user = data.penalties.find(user => user.name === name);
    if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    // Einen weiteren Strich hinzufügen
    user.strikes += 1;

    // Aktualisierte Daten in die JSON-Datei schreiben
    writeData(data);

    res.json(user);
}

// Funktion zum Hinzufügen einer Datei
async function addFile(req, res) {
    const { name, filename } = req.body; // Benutzername und Dateiname aus der Anfrage
    const uploadDate = new Date().toISOString(); // Aktuelles Datum als Upload-Datum
    const data = readData();

    const user = data.penalties.find(user => user.name === name);
    if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    // Dateien-Array erstellen, falls es noch nicht existiert
    user.files = user.files || [];

    // Datei mit Dateiname und Upload-Datum hinzufügen
    user.files.push({ filename, uploadDate });

    // Aktualisierte Daten in die JSON-Datei schreiben
    writeData(data);

    res.json({ message: "Datei hinzugefügt", file: { filename, uploadDate } });
}

module.exports = { getPenalties, addStrike, addFile };
