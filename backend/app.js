// app.js
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const penaltyRoutes = require('./routes/penaltyRoutes');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware für das Parsen von Cookies
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session-Setup
app.use(session({
    secret: 's3cR3tK3y!@2024$%^#MySecureSession',
    resave: false,
    saveUninitialized: false, // Keine ungenutzten Sessions erstellen
    cookie: { 
        maxAge: 10800000, // Cookie-Ablaufzeit
        secure: false, // Auf true setzen, wenn HTTPS verwendet wird
        sameSite: 'lax'
    }
}));

// Benutzerbezogene Verzeichnisse anlegen
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userDir = path.join(__dirname, 'uploads', req.query.user);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
            console.log(`User directory created: ${userDir}`);
        }
        cb(null, userDir);
    },
    filename: function (req, file, cb) {
        let fileName = file.originalname;
        const filePath = path.join(__dirname, 'uploads', req.query.user, fileName);
        let fileCounter = 1;
        while (fs.existsSync(filePath)) {
            const nameParts = fileName.split('.');
            const ext = nameParts.pop();
            const baseName = nameParts.join('.');
            fileName = `${baseName}(${fileCounter++}).${ext}`;
        }
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage }); // Definiere die Upload-Variable

// Authentifizierungsrouten
app.use('/api/auth', authRoutes);
app.use('/api/penalties', penaltyRoutes);

// Admin- und Filedata-Routen
app.get('/admin', (req, res) => {
    console.log('Serving admin.html');
    res.sendFile(path.join(__dirname, '../frontend/private/admin.html'));
});

app.get('/filedata', (req, res) => {
    console.log('Serving filedata.html');
    res.sendFile(path.join(__dirname, '../frontend/private/filedata.html'));
});

// API-Routen
app.post('/api/upload', upload.array('files[]'), (req, res) => {
    console.log('Files uploaded:', req.files);
    res.send({ message: 'Dateien erfolgreich hochgeladen', files: req.files });
});

app.get('/api/files', (req, res) => {
    const user = req.query.user;
    const userDir = path.join(__dirname, 'uploads', user);
    console.log(`Request to get files for user: ${user}`);
    
    if (!fs.existsSync(userDir)) {
        console.log('User directory not found, returning 404');
        return res.status(404).send({ message: 'Benutzerordner nicht gefunden' });
    }

    fs.readdir(userDir, (err, files) => {
        if (err) {
            console.error('Error reading files:', err);
            return res.status(500).send({ message: 'Fehler beim Abrufen der Dateien' });
        }
        const fileLinks = files.map(file => ({
            name: file,
            url: `/uploads/${user}/${file}`
        }));
        console.log('Files found:', fileLinks);
        res.json(fileLinks);
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend/public')));

module.exports = app;
