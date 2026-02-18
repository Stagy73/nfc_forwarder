const express = require('express');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// CONFIGURATION DE TEST
const clients = [
    {
        name: "test",  // Identifiant simple pour vos tests
        databaseId: "30b1a922a66881308628f908962c1af3",  // VOTRE ID DE BASE
        columnName: "UID"  // La colonne qui contient l'identifiant
    }
    // Vous ajouterez vos clients ici plus tard
];

// Route de redirection
app.get('/r/:clientId/:tagId', async (req, res) => {
    const { clientId, tagId } = req.params;
    
    // Trouver le client
    const client = clients.find(c => c.name === clientId);
    if (!client) {
        return res.status(404).send('Client non trouvé');
    }
    
    // Initialiser Notion
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    
    try {
        console.log(`🔍 Recherche: client=${clientId}, tag=${tagId}`);
        
        // Chercher le tag dans la base
        const response = await notion.databases.query({
            database_id: client.databaseId,
            filter: {
                property: client.columnName,
                rich_text: { equals: tagId }
            }
        });
        
        if (response.results.length > 0) {
            const page = response.results[0];
            // L'URL est dans la propriété "URL"
            const url = page.properties.URL?.url;
            if (url) {
                console.log(`✅ Redirection: ${tagId} -> ${url}`);
                return res.redirect(url);
            } else {
                console.log(`⚠️  Pas d'URL trouvée pour ${tagId}`);
                return res.status(404).send('URL non trouvée pour ce tag');
            }
        }
        
        console.log(`❌ Tag non trouvé: ${tagId}`);
        res.status(404).send('Tag non trouvé');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        res.status(500).send('Erreur serveur');
    }
});

// Route de test
app.get('/', (req, res) => {
    res.send(`
        <h1>🚀 NFC Forwarder opérationnel !</h1>
        <p>Testez avec : <code>/r/test/TEST-001</code></p>
        <p>Vérifiez les logs pour voir ce qui se passe.</p>
    `);
});

app.listen(port, () => {
    console.log(`✅ Serveur démarré sur le port ${port}`);
    console.log(`🔗 URL de test: http://localhost:${port}/r/test/TEST-001`);
});