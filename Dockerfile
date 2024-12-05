# Nutze das Basis-Image
FROM node:20

# Setze das Arbeitsverzeichnis
WORKDIR /usr/src/app

# Kopiere nur package.json und package-lock.json in den Container
COPY package.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den Rest des Projekts
COPY . .

# Exponiere den Port
EXPOSE 3000

# Starte den Server
CMD ["node", "backend/server.js"]
