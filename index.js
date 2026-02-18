const express = require('express');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ID de VOTRE base de configuration clients (créée avec le script)
const CONFIG_DATABASE_ID = "30b1a922-a668-8148-9b6f-d9699e74e1ef";

// Cache pour éviter de trop solliciter l'API Notion
let clientsCache = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Initialiser Notion avec votre token
const notion = new Client({ auth: process.env.NOTION_TOKEN });

/**
 * Charge la configuration des clients depuis la base Notion
 * Utilise un cache de 5 minutes pour éviter de surcharger l'API
 */
async function loadClientsConfig() {
    try {
        // Vérifier si le cache est encore valide
        const now = Date.now();
        if (now - lastCacheUpdate < CACHE_DURATION && clientsCache.length > 0) {
            console.log(`📦 Utilisation du cache (${Math.round((now - lastCacheUpdate)/1000)}s)`);
            return clientsCache;
        }

        console.log("🔄 Rechargement de la configuration clients depuis Notion...");
        
        // Requête à la base de configuration
        const response = await notion.databases.query({
            database_id: CONFIG_DATABASE_ID,
            filter: {
                property: "Actif",
                checkbox: { equals: true }
            }
        });

        // Transformer les résultats en tableau de clients
        clientsCache = response.results.map(page => {
            // Extraire les propriétés
            const name = page.properties["Nom du Client"]?.title[0]?.text?.content;
            const databaseId = page.properties["Database ID"]?.rich_text[0]?.text?.content;
            const columnName = page.properties["Colonne UID"]?.select?.name || "UID";
            
            return {
                name,
                databaseId,
                columnName
            };
        }).filter(client => client.name && client.databaseId); // Garder seulement les clients valides

        lastCacheUpdate = now;
        console.log(`✅ ${clientsCache.length} clients actifs chargés`);
        
        // Afficher la liste des clients pour déboguer
        clientsCache.forEach(c => console.log(`   - ${c.name} (colonne: ${c.columnName})`));
        
        return clientsCache;
    } catch (error) {
        console.error('❌ Erreur lors du chargement de la configuration:', error.message);
        // En cas d'erreur, retourner l'ancien cache si disponible
        if (clientsCache.length > 0) {
            console.log('⚠️  Utilisation de l\'ancien cache en raison de l\'erreur');
            return clientsCache;
        }
        return [];
    }
}

/**
 * Route principale de redirection
 * Format: /r/:clientId/:tagId
 */
app.get('/r/:clientId/:tagId', async (req, res) => {
    const { clientId, tagId } = req.params;
    
    console.log(`\n🔍 Requête reçue: client=${clientId}, tag=${tagId}`);
    
    try {
        // Charger la configuration (avec cache)
        const clients = await loadClientsConfig();
        
        // Trouver le client correspondant
        const client = clients.find(c => c.name === clientId);
        if (!client) {
            console.log(`❌ Client non trouvé: ${clientId}`);
            return res.status(404).send(`
                <h2>Client non trouvé</h2>
                <p>Le client "${clientId}" n'existe pas ou n'est pas actif.</p>
                <p><a href="/">Retour à l'accueil</a></p>
            `);
        }
        
        console.log(`📋 Client trouvé: ${client.name}`);
        console.log(`   Database ID: ${client.databaseId}`);
        console.log(`   Colonne UID: ${client.columnName}`);
        
        // Chercher le tag dans la base du client
        console.log(`🔎 Recherche du tag "${tagId}"...`);
        
        const response = await notion.databases.query({
            database_id: client.databaseId,
            filter: {
                property: client.columnName,
                rich_text: { equals: tagId }
            }
        });
        
        console.log(`📊 Résultats: ${response.results.length} entrée(s) trouvée(s)`);
        
        if (response.results.length > 0) {
            const page = response.results[0];
            
            // Récupérer l'URL (dans la propriété "URL")
            const urlProperty = page.properties.URL;
            const url = urlProperty?.url;
            
            if (url) {
                console.log(`✅ Redirection: ${tagId} -> ${url}`);
                
                // Journaliser pour analyse
                console.log(`   📝 Détails du tag:`);
                console.log(`      Nom: ${page.properties["Nom du Tag"]?.title[0]?.text?.content || 'N/A'}`);
                console.log(`      Statut: ${page.properties["Statut"]?.select?.name || 'N/A'}`);
                
                // Rediriger vers l'URL
                return res.redirect(url);
            } else {
                console.log(`⚠️  URL non trouvée pour le tag ${tagId}`);
                console.log(`   Propriétés disponibles:`, Object.keys(page.properties));
                return res.status(404).send(`
                    <h2>URL non trouvée</h2>
                    <p>Le tag "${tagId}" existe mais n'a pas d'URL configurée.</p>
                    <p>Vérifiez que la colonne "URL" est bien remplie dans Notion.</p>
                    <p><a href="/">Retour à l'accueil</a></p>
                `);
            }
        }
        
        console.log(`❌ Tag non trouvé: ${tagId}`);
        res.status(404).send(`
            <h2>Tag non trouvé</h2>
            <p>Aucun tag avec l'identifiant "${tagId}" n'a été trouvé.</p>
            <p>Vérifiez que :</p>
            <ul>
                <li>L'identifiant est correct (attention aux majuscules et au #)</li>
                <li>Le tag existe bien dans la base Notion du client</li>
                <li>La colonne "${client.columnName}" contient exactement "${tagId}"</li>
            </ul>
            <p><a href="/">Retour à l'accueil</a></p>
        `);
        
    } catch (error) {
        console.error('❌ Erreur serveur:', error);
        res.status(500).send(`
            <h2>Erreur serveur</h2>
            <p>Une erreur est survenue : ${error.message}</p>
            <p><a href="/">Retour à l'accueil</a></p>
        `);
    }
});

/**
 * Route d'administration pour forcer le rechargement de la configuration
 */
app.get('/admin/reload', async (req, res) => {
    console.log('🔄 Rechargement forcé de la configuration...');
    clientsCache = [];
    lastCacheUpdate = 0;
    const clients = await loadClientsConfig();
    res.send(`
        <h2>Configuration rechargée !</h2>
        <p>${clients.length} client(s) actif(s) chargé(s).</p>
        <ul>
            ${clients.map(c => `<li>${c.name} (${c.columnName})</li>`).join('')}
        </ul>
        <p><a href="/">Retour à l'accueil</a></p>
    `);
});

/**
 * Route d'accueil
 */
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>NFC Forwarder</title>
            <style>
                body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
                h1 { color: #2563eb; }
                code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
                .card { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .info { color: #6b7280; }
            </style>
        </head>
        <body>
            <h1>🚀 NFC Forwarder Professionnel</h1>
            
            <div class="card">
                <h2>Système de redirection dynamique</h2>
                <p>Configuration lue depuis Notion en temps réel.</p>
                <p>Utilisez les URLs au format : <code>/r/CLIENT_ID/TAG_ID</code></p>
            </div>
            
            <div class="card">
                <h3>Test avec votre configuration</h3>
                <p>Client de test : <code>test</code></p>
                <p>Tags disponibles : <code>#NFC-001</code>, <code>#NFC-002</code>, ...</p>
                <p>👉 <a href="/r/test/%23NFC-001">Tester #NFC-001</a></p>
            </div>
            
            <div class="card">
                <h3>Administration</h3>
                <p><a href="/admin/reload">🔄 Recharger la configuration</a> (après ajout d'un client)</p>
            </div>
            
            <p class="info">Cache: 5 minutes | ${new Date().toLocaleString()}</p>
        </body>
        </html>
    `);
});

// Démarrer le serveur
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 NFC FORWARDER DÉMARRÉ');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${port}`);
    console.log(`🔗 URL: https://nfc-forwarder.onrender.com`);
    console.log(`⏱️  Cache: ${CACHE_DURATION/60000} minutes`);
    console.log('='.repeat(50) + '\n');
    
    // Charger la configuration au démarrage
    loadClientsConfig().then(clients => {
        console.log('✅ Configuration initiale chargée');
    });
});