const express = require('express');
const router = express.Router();
const { loadClientsConfig } = require('../services/notion');

// Route principale de redirection
router.get('/r/:clientId/:tagId', async (req, res) => {
    const { clientId, tagId } = req.params;
    const notion = req.app.locals.notion;
    
    console.log(`\n🔍 Requête reçue: client=${clientId}, tag=${tagId}`);
    
    try {
        const clients = await loadClientsConfig(notion);
        const client = clients.find(c => c.name === clientId);
        
        if (!client) {
            return res.status(404).send(`
                <h2>Client non trouvé</h2>
                <p>Le client "${clientId}" n'existe pas ou n'est pas actif.</p>
                <p><a href="/">Retour à l'accueil</a></p>
            `);
        }
        
        const response = await notion.databases.query({
            database_id: client.databaseId,
            filter: {
                property: client.columnName,
                rich_text: { equals: tagId }
            }
        });
        
        if (response.results.length > 0) {
            const page = response.results[0];
            const url = page.properties.URL?.url;
            
            if (url) {
                console.log(`✅ Redirection: ${tagId} -> ${url}`);
                return res.redirect(url);
            }
        }
        
        res.status(404).send('<h2>Tag non trouvé</h2><p><a href="/">Retour</a></p>');
        
    } catch (error) {
        res.status(500).send('<h2>Erreur serveur</h2>');
    }
});

module.exports = router;