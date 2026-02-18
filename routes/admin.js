const express = require('express');
const router = express.Router();
const { loadClientsConfig, invalidateCache } = require('../services/notion');

// Route pour recharger la configuration
router.get('/reload', async (req, res) => {
    invalidateCache();
    const clients = await loadClientsConfig(req.app.locals.notion);
    res.send(`
        <h2>Configuration rechargée !</h2>
        <p>${clients.length} client(s) actif(s) chargé(s).</p>
        <p><a href="/">Retour à l'accueil</a></p>
    `);
});

module.exports = router;