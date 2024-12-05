const fs = require('fs');
const path = require('path');

const cookieDataPath = path.join(__dirname, '/data/cookieData.json');

// Funktion zum Überprüfen, ob der Benutzer-Cookie in der Liste der gespeicherten Cookies vorhanden ist
function compareCookies(userCookie) {
    let cookieData;

    try {
        cookieData = JSON.parse(fs.readFileSync(cookieDataPath, 'utf-8'));
    } catch (error) {
        console.error('Fehler beim Lesen der cookieData.json:', error);
        return false; // Wenn das Lesen der Datei fehlschlägt, als ungültig betrachten
    }

    // Überprüfen, ob der Benutzer-Cookie in der Liste der gespeicherten Cookies vorhanden ist
    return cookieData.cookies.includes(userCookie);
}

module.exports = { compareCookies };
