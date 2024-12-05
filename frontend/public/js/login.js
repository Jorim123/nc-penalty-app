document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            window.location.href = '/admin';  // Weiterleitung zur Admin-Seite
        } else {
            const errorData = await response.json();
            alert(`Login fehlgeschlagen: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Fehler beim Login:', error);
        alert('Login fehlgeschlagen. Bitte versuche es erneut.');
    }
});
