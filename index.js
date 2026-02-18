const express = require('express');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuration des clients (à remplacer par vos données)
const clients = [
    {
        name: "restaurant-pierre",
        databaseId: "ID_DE_SA_BASE_INVENTAIRE",
        columnName: "UID"
    },
    {
        name: "hotel-plage", 
        databaseId: "ID_DE_SA_BASE_INVENTAIRE_2",
        columnName: "UID"
    }
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
            // Supposons que l'URL est dans la propriété "URL"
            const url = page.properties.URL?.url;
            if (url) {
                console.log(`✅ Redirection: ${tagId} -> ${url}`);
                return res.redirect(url);
            }
        }
        
        res.status(404).send('Tag non trouvé');
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Route de test
app.get('/', (req, res) => {
    res.send('🚀 NFC Forwarder opérationnel !');
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
