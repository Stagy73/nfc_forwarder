const express = require('express');
const router = express.Router();
const { CONFIG_DATABASE_ID, invalidateCache } = require('../services/notion');
const fs = require('fs');
const path = require('path');

// Servir la page HTML statique
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/signup.html'));
});

// API endpoint pour traiter l'inscription
router.post('/api/signup', express.json(), async (req, res) => {
    const { businessName, email, phone, databaseId, columnName } = req.body;
    const notion = req.app.locals.notion;
    
    if (!businessName || !email || !databaseId) {
        return res.status(400).json({ error: 'Champs requis manquants' });
    }
    
    const clientId = businessName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 30) + '-' + Date.now().toString().slice(-4);
    
    try {
        await notion.pages.create({
            parent: { database_id: CONFIG_DATABASE_ID },
            properties: {
                "Nom du Client": { title: [{ text: { content: clientId } }] },
                "Database ID": { rich_text: [{ text: { content: databaseId } }] },
                "Colonne UID": { select: { name: columnName || "UID" } },
                "Actif": { checkbox: true },
                "Notes": { rich_text: [{ text: { content: `Email: ${email}${phone ? ' - Tél: ' + phone : ''}` } }] },
                "Date d'ajout": { date: { start: new Date().toISOString().split('T')[0] } }
            }
        });
        
        invalidateCache();
        res.json({ success: true, clientId });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;