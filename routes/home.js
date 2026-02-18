const express = require('express');
const router = express.Router();

// Route d'accueil - Redirige directement vers l'inscription
router.get('/', (req, res) => {
    res.redirect('/signup');
});

module.exports = router;