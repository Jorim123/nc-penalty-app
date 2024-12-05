const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const cookieSignature = require('cookie-signature'); // Importiere die cookie-signature-Bibliothek

const dataPath = path.join(__dirname, '../data/userData.json');
const cookieDataPath = path.join(__dirname, '../data/cookieData.json');
const { compareCookies } = require('../cookiecompare.js');

// Funktion zum Lesen der Benutzerdaten
function readData() {
    if (!fs.existsSync(dataPath)) {
        throw new Error('Benutzerdaten nicht gefunden');
    }
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
}

// Funktion zum Lesen der Cookie-Daten
function readCookieData() {
    if (!fs.existsSync(cookieDataPath)) {
        fs.writeFileSync(cookieDataPath, JSON.stringify({ cookies: [], expires: null }));
        return { cookies: [], expires: null };
    }
    const data = fs.readFileSync(cookieDataPath);
    return JSON.parse(data);
}

// Login-Funktion
async function login(req, res) {
    const { username, password } = req.body;

    console.log('Received login request:', req.body);

    if (!username || !password) {
        console.log('Username or password not provided');
        return res.status(400).send({ message: 'Benutzername und Passwort erforderlich' });
    }

    const data = readData();
    const user = data.users.find(user => user.username.toLowerCase() === username.toLowerCase());

    if (!user) {
        console.log('Benutzername nicht gefunden:', username);
        return res.status(400).send({ message: 'Ungültiger Benutzername' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        console.log('Ungültiges Passwort für Benutzer:', username);
        return res.status(400).send({ message: 'Ungültiges Passwort' });
    }

    // Existierende Session prüfen und beenden, falls vorhanden
    if (req.session && req.session.user) {
        console.log(`Existierende Session gefunden für Benutzer: ${req.session.user.username}. Beende alte Session.`);
        await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    // Eine neue Session erzeugen
    req.session.regenerate((err) => {
        if (err) {
            console.error("Fehler beim Erstellen einer neuen Session:", err);
            return res.status(500).send({ message: "Fehler beim Erstellen der Session" });
        }

        // Setze neue Session-Daten
        req.session.user = {
            username: user.username,
            role: user.role
        };

        req.session.save(() => {
            // Neuer Cookie-Wert erstellen
            const newCookieValue = req.sessionID; // Verwende die neue Session-ID
            const signedCookieValue = cookieSignature.sign(newCookieValue, 's3cR3tK3y!@2024$%^#MySecureSession');
            console.log(`Neuer, signierter Cookie-Wert erstellt: ${signedCookieValue}`);

            // Füge den neuen Cookie hinzu
            let cookieData = readCookieData().cookies || [];
            cookieData = cookieData.filter(cookie => !cookie.startsWith(`s:`)); // Entferne alte Cookies

            // Füge den neuen signierten Cookie hinzu
            cookieData.push(`s:${signedCookieValue}`); 

            // Speichere die Cookies als Array in cookieData.json
            fs.writeFileSync(cookieDataPath, JSON.stringify({
                cookies: cookieData,
                expires: new Date(Date.now() + 10800000).toISOString() // 3 Stunden
            }));

            console.log(`Cookie wurde erfolgreich gespeichert: ${signedCookieValue}`);
            
            // Setze den Cookie im Response Header
            res.cookie('connect.sid', signedCookieValue); // Sende den signierten Cookie an den Benutzer
            
            // Weiterleitung zu admin.html
            res.redirect('/admin');
        });
    });
}


// Session-Überprüfungsfunktion
async function checkSession(req, res) {
    try {
        const userCookie = decodeURIComponent(req.headers.cookie.split('; ').find(row => row.startsWith('connect.sid=')).split('=')[1]);
        const cookieData = readCookieData();

        if (!compareCookies(userCookie)) {
            return res.status(401).send({ message: 'Session invalid' });
        }

        return res.status(200).send({ message: 'Session valid' });
    } catch (error) {
        console.error('Fehler beim Überprüfen der Session:', error);
        return res.status(500).send({ message: 'Error checking session' });
    }
}

// Logout-Funktion im authController.js
function logout(req, res) {
    const username = req.session?.user?.username || 'Unbekannter Benutzer';

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ message: 'Logout fehlgeschlagen' });
        }

        // Server-Log des Benutzernamens beim Logout
        console.log(`Benutzer wurde ausgeloggt: ${username}`);
        
        // Entferne das Session-Cookie
        res.clearCookie('connect.sid');
        res.send({ message: 'Logout erfolgreich' });
    });
}


module.exports = { login, logout, checkSession };
