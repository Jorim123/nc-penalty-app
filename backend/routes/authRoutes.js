// authRoutes.js
const express = require('express');
const { login, logout, checkSession } = require('../controllers/authController.js');
const router = express.Router();

// Authentifizierungsrouten
router.post('/login', login);   // Route für Login
router.post('/logout', logout);  // Route für Logout als POST
router.get('/check-session', checkSession); // Neue Route zur Überprüfung der Session

module.exports = router;
