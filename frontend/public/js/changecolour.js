// Lade die gespeicherten Farben beim Laden der Seite
function loadBlockColors() {
    fetch('/api/penalties')  // Hol die aktuellen Strafen vom Server, inklusive blockColor
        .then(response => response.json())
        .then(data => {
            data.forEach(user => {
                const userBlocks = document.querySelectorAll(`.strikethrough-diagonal[data-user="${user.name}"]`);
                userBlocks.forEach(block => {
                    const index = block.getAttribute('data-index');
                    if (user.blockColor && user.blockColor[index] === 'white') {
                        block.style.color = 'white'; // Setze die Farbe auf weiß, wenn sie auf dem Server gespeichert ist
                    }
                });
            });
        })
        .catch(error => console.error('Fehler beim Laden der Strichblock-Farben:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    loadBlockColors(); // Lade die gespeicherten Strichblock-Farben beim Laden der Seite
});
