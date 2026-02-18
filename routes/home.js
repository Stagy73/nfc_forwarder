const express = require('express');
const router = express.Router();

// Route d'accueil
router.get('/', (req, res) => {
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
                .btn {
                    display: inline-block;
                    background: #2563eb;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 5px;
                }
                .btn:hover { background: #1d4ed8; }
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
                <h3>Liens utiles</h3>
                <a href="/signup" class="btn">📝 Inscription client</a>
                <a href="/admin/reload" class="btn">🔄 Recharger configuration</a>
            </div>
            
            <div class="card">
                <h3>Test avec votre configuration</h3>
                <p>Client de test : <code>test</code></p>
                <p>Tags disponibles : <code>#NFC-001</code>, <code>#NFC-002</code>, ...</p>
                <p>👉 <a href="/r/test/%23NFC-001">Tester #NFC-001</a></p>
            </div>
            
            <p class="info">Cache: 5 minutes | ${new Date().toLocaleString()}</p>
        </body>
        </html>
    `);
});

module.exports = router;