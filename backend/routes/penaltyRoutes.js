const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Pfad zur userData.json Datei
const dataPath = path.join(__dirname, '../data/userData.json');

// Funktion zum Lesen der JSON-Datei
function readData() {
    const data = fs.readFileSync(dataPath);
    return JSON.parse(data);
}

// Funktion zum Schreiben in die JSON-Datei
function writeData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Route zum Abrufen der Strafen (penalties)
router.get('/', (req, res) => {
    const data = readData();
    const penalties = data.penalties.map(user => ({
        ...user,
        blockColor: user.blockColor || {} // Fügen Sie die Blockfarben hinzu
    }));
    res.send(penalties);
});

// Route zum Hinzufügen eines neuen Benutzers
router.post('/addUser', (req, res) => {
    const { name } = req.body;
    const data = readData();

    // Überprüfen, ob der Benutzer bereits existiert
    const existingUser = data.penalties.find(user => user.name === name);
    if (existingUser) {
        return res.status(400).send({ message: 'Benutzer existiert bereits' });
    }

    // Neuen Benutzer hinzufügen
    const newUser = {
        name: name,
        strikes: 0,
        reasons: [],
        blockColor: {},
        files: []  // Initialisiere das files-Array für Dateispeicher
    };

    data.penalties.push(newUser);
    writeData(data);
    res.send({ message: 'Benutzer erfolgreich hinzugefügt' });
});

// Route zum Hinzufügen eines Striches
router.post('/add', (req, res) => {
    const { name, reason, date } = req.body;
    const data = readData();
    const user = data.penalties.find(user => user.name === name);

    if (user) {
        user.strikes += 1;

        // Begründungen als Objekte mit Text und Datum speichern
        user.reasons.push({ text: reason, date });

        // Prüfe, ob ein neuer Block erstellt werden muss
        const fullBlocks = Math.floor(user.strikes / 5);
        user.blockColor = user.blockColor || {};

        // Wenn es einen neuen Block gibt, aber noch keinen Eintrag im blockColor, erstelle ihn
        if (!user.blockColor[fullBlocks]) {
            user.blockColor[fullBlocks] = '#ffcc00';  // Standardfarbe Gelb für neue Blöcke
        }

        writeData(data);
        res.send({ message: 'Strich hinzugefügt und Block aktualisiert' });
    } else {
        res.status(400).send({ message: 'Benutzer nicht gefunden' });
    }
});

// Route zum Hinzufügen einer Datei mit Metadaten
router.post('/addFile', (req, res) => {
    const { name, filename } = req.body; // Erwartet den Benutzernamen und Dateinamen
    const uploadDate = new Date().toISOString(); // Setze das aktuelle Datum als Upload-Datum
    const data = readData();
    const user = data.penalties.find(user => user.name === name);

    if (!user) {
        return res.status(404).send({ message: 'Benutzer nicht gefunden' });
    }

    // Sicherstellen, dass das files-Array existiert
    user.files = user.files || [];
    user.files.push({ filename, uploadDate }); // Datei mit Metadaten hinzufügen

    // Speichern der Änderungen in der JSON-Datei
    writeData(data);
    res.send({ message: 'Datei hinzugefügt', file: { filename, uploadDate } });
});

// Route zum Abrufen der Begründungen
router.get('/reasons', (req, res) => {
    const { name } = req.query;
    const data = readData();
    const user = data.penalties.find(user => user.name === name);

    if (user) {
        res.send(user.reasons || []);
    } else {
        res.status(400).send({ message: 'Benutzer nicht gefunden' });
    }
});

// Route zum Abrufen der hochgeladenen Dateien für einen Benutzer
router.get('/files', (req, res) => {
    const user = req.query.user;
    const userDir = path.join(__dirname, '../uploads', user);

    if (!fs.existsSync(userDir)) {
        return res.status(404).send({ message: 'Benutzerordner nicht gefunden' });
    }

    fs.readdir(userDir, (err, files) => {
        if (err) {
            return res.status(500).send({ message: 'Fehler beim Abrufen der Dateien' });
        }
        const fileLinks = files.map(file => ({
            name: file,
            url: `/uploads/${user}/${file}`
        }));
        res.json(fileLinks);
    });
});

// Route zum Ändern der Farbe eines 5er-Blocks
router.post('/updateColor', (req, res) => {
    const { name, blockIndex } = req.body;
    const data = readData();
    const user = data.penalties.find(user => user.name === name);

    if (user) {
        user.blockColor = user.blockColor || {};
        user.blockColor[blockIndex] = 'white';
        writeData(data);
        res.send({ message: 'Blockfarbe aktualisiert' });
    } else {
        res.status(400).send({ message: 'Benutzer nicht gefunden' });
    }
});

module.exports = router;
