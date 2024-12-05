# Strichenliste Programm

## Funktion
<p>&nbsp;</p>
Das Programm dient als Strichliste, die verwendet wird, um Striche zu vergeben, wenn die festgelegten Regeln nicht befolgt werden. Nach fünf Strichen muss eine Strafaufgabe erledigt werden.
<p>&nbsp;</p>

### Funktionen des Programms:
- Im Frontend gibt es zwei Hauptordner: **/public** und **/private**.
- `admin.html` ermöglicht es, Striche hinzuzufügen, Begründungen anzuzeigen, Dateien hochzuladen und Dateien anzuzeigen.
- Benutzer können in `admin.html` hinzugefügt werden, wobei ein Benutzername eingegeben wird und ein neuer Eintrag in `userData.json` erstellt wird.
- Striche werden in 5er-Blöcken dargestellt, wobei der fünfte Strich als Querstrich angezeigt wird.
- Nach Abschluss einer Strafaufgabe kann der jeweilige 5er-Block angeklickt werden, um die Farbe auf Weiss zu ändern und somit anzuzeigen, dass die Aufgabe abgeschlossen ist.
- Im index.html wird eine Krone für den Benutzer angezeigt, der am meisten Striche hat. Es können auch mehrere Benutzer eine Krone haben, wenn sie alle genau gleich viele Striche haben.
- Die Strafaufgaben können per Drag-and-Drop hochgeladen werden.
- Danach kann man die Datei in der `filedata.html` ansehen, indem man im  `admin.html` auf den jeweiligen Button klickt.


<p>&nbsp;</p>

### Speicherung der Strafaufgaben

- Die Strafaufgaben werden in einem Ordner im Verzeichnis **/backend/uploads** unter dem jeweiligen Benutzer gespeichert.
- Um die Dateien einzusehen, kann man auf den entsprechenden Button in `admin.html` klicken, der ein neues Fenster öffnet, in dem alle Dateien des Benutzers angezeigt werden.
<p>&nbsp;</p>

### Zugriff auf index.html

- In `index.html` kann man nur die Striche sowie die Regeln und eine Erklärung der Strafaufgaben über das Burger-Menü einsehen.
- Es gibt die Möglichkeit, zur `login.html` weitergeleitet zu werden, um sich anzumelden und Zugriff auf `admin.html` zu erhalten.
- Wenn ein neuer Benutzer in der Datei **/backend/data/userData.json** hinzugefügt wird, sollte automatisch ein Ordner erstellt werden, sobald der neue Benutzer eine Datei in seinem Ordner hochlädt.

<p>&nbsp;</p>
<p>&nbsp;</p>

## Installation

###  Schritt 1: Installation von Node.js
- Installiere Node.js und npm auf deinem Computer, wenn du sie noch nicht hast.
- Öffne ein Terminal und gib den Befehl `node -v` ein, um zu überprüfen, ob Node.js installiert ist.
- Falls Node.js nicht installiert ist, bitte diese Commands im Powershell ausführen:
```Powershell
# installs fnm (Fast Node Manager)
winget install Schniz.fnm

# configure fnm environment
fnm env --use-on-cd | Out-String | Invoke-Expression

# download and install Node.js
fnm use --install-if-missing 20

# verifies the right Node.js version is in the environment
node -v # should print `v20.18.0`

# verifies the right npm version is in the environment
npm -v # should print `10.8.2`
```

Falls dies nicht funktioniert, [den Prebuilt Installer herunterladen](https://nodejs.org/en/download/prebuilt-installer).



<p>&nbsp;</p>


### Schritt 2: Installation der benötigten Module
- Öffne ein Terminal und navigiere in das Verzeichnis /nc-penalty-app
- Führe den folgenden Befehl aus:
```
npm install
```
<p>&nbsp;</p>

### Schritt 3: Starten des Servers
- Öffne ein Terminal und navigiere in das Verzeichnis /nc-penalty-app
- Führe den folgenden Befehl aus:
```
node backend\server.js
```
<p>&nbsp;</p>
<p>&nbsp;</p>

## Ordnerstruktur
```
/nc-penalty-list
│
├── /backend
│   │
│   ├── /controllers               # Enthält alle Controller für die API-Logik
│   │   ├── authController.js      # Login, Logout und Authentifizierung
│   │   ├── penaltyController.js   # Strafenverwaltung (Striche hinzufügen, abrufen)
│   │
│   ├── /data                      # Statische Daten
│   │   └── userData.json          # Beispiel-Daten für Benutzer und Strafen
│   │   └── cookieData.json
│   │
│   │
│   ├── /routes                    # API-Routen für verschiedene Bereiche
│   │   ├── authRoutes.js          # Authentifizierungsrouten
│   │   └── penaltyRoutes.js       # Routen für Strafen
│   │
│   ├── /uploads                   # Benutzerbezogene Dateien werden hier hochgeladen
│   │   └── /[userfolders]         # Jeder Benutzer hat seinen eigenen Ordner für hochgeladene Dateien
│   │
│   ├── app.js                     # Haupt-Express-App, die alle Routen und Middleware verbindet
│   └── server.js                  # Startet den Server und prüft Benutzerordner
│   └── cookiecompare.js           
│
├── /frontend
│   ├── /public                    # Statische Dateien wie HTML, CSS und JS (öffentlich zugänglich)
│   │   ├── /css
│   │   │   └── styles.css         # Haupt-CSS-Datei für das gesamte Frontend-Design
│   │   ├── /js
│   │   │   ├── changecolour.js    # Farbwechsel-Logik für Striche
│   │   │   ├── dragdrop.js        # Logik für Drag-and-Drop-Uploads
│   │   │   ├── dropdown.js        # Dropdown-Menü Logik
│   │   │   ├── index.js           # Startseite Strafen-Logik
│   │   │   ├── login.js           # Login-Seitenlogik
│   │   │   └── admin.js
│   │   │
│   │   └── /dropdown              # HTML-Dateien für Dropdown-Seiten wie Regeln und Strafen
│   │   │   ├── rules.html         # Regeln-Seite
│   │   │   └── punishments.html   # Strafen-Seite
│   │   ├── /images
│   │   │   └── crown.png
│   │   │
│   │   ├── index.html                 # Hauptseite (öffentlich zugänglich)
│   │   └── login.html    
│   │             
│   ├── /private                       # Geschützter Bereich für administrative Seiten
│       └── admin.html
│       └── filedata.html              # Admin-Seite nur für eingeloggte Benutzer
│
├── /node_modules                  # Node.js-Abhängigkeiten
├── .env                           # Umgebungsvariablen (z.B. JWT-Secret, DB-URL)
├── .gitignore                     # Dateien und Ordner, die in Git ignoriert werden sollen
├── package.json                   # Projektmetadaten und Abhängigkeiten
├── package-lock.json              # Exakte Versionen der installierten Node-Abhängigkeiten
└── README.md                      # Projektbeschreibung und Anleitungen
```


<p>&nbsp;</p>
<p>&nbsp;</p>

## User und Passwort änderung:
```javascript
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Pfad zur JSON-Datei mit den Benutzerdaten
const dataPath = path.join(__dirname, 'data/userData.json');

// Hilfsfunktion zum Lesen der JSON-Datei
function readData() {
    if (!fs.existsSync(dataPath)) {
        console.error('Die Datei userData.json wurde nicht gefunden!');
        process.exit(1);
    }
    const data = fs.readFileSync(dataPath);
    return JSON.parse(data);
}

// Hilfsfunktion zum Speichern der geänderten Daten in der JSON-Datei
function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

Admin-Passwort ändern

async function changeAdminPassword() {
    const username = '**Username**';  // Admin-Benutzername
    const newPassword = '**Passwort**';  // Neues Passwort, das gehashed werden soll

    // Admin-Daten aus der JSON-Datei laden
    const data = readData();
    const user = data.users.find(user => user.username === username);

    if (!user) {
        console.error('Admin-Benutzer nicht gefunden!');
        return;
    }

    // Passwort prüfen und neues Passwort hashen
    console.log('Aktuelles gehashtes Passwort:', user.password);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Passwort aktualisieren
    user.password = hashedPassword;

    // Aktualisierte Daten speichern
    saveData(data);

    console.log('Passwort erfolgreich geändert!');
}

// Führe die Funktion aus
changeAdminPassword().catch(err => console.error(err));
```

<p>&nbsp;</p>
<p>&nbsp;</p>


## Passwort Gültigkeit überprüfung:
```javascript
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data/userData.json');

// Funktion zum Hashen des Passworts und Speichern in der JSON-Datei
async function hashPassword() {
    const password = '**Passwort**';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lese die JSON-Datei
    const data = fs.readFileSync(dataPath, 'utf-8');
    const jsonData = JSON.parse(data);

    // Aktualisiere das Passwort des Admin-Benutzers
    jsonData.users[0].password = hashedPassword;

    // Schreibe die aktualisierte JSON-Datei zurück
    fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2));

    console.log('Passwort erfolgreich gehasht und gespeichert');
}

hashPassword().catch(console.error);
```