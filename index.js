const express = require('express');
const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ===== MIDDLEWARES =====
// Pour parser le JSON et les formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pour servir les fichiers statiques (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// ===== INITIALISATION NOTION =====
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Rendre notion accessible dans toutes les routes
app.locals.notion = notion;

// ===== IMPORT DES ROUTES =====
const homeRoutes = require('./routes/home');
const redirectRoutes = require('./routes/redirect');
const adminRoutes = require('./routes/admin');
const signupRoutes = require('./routes/signup');

// ===== UTILISATION DES ROUTES =====
app.use('/', homeRoutes);           // Page d'accueil (redirige vers /signup)
app.use('/', redirectRoutes);        // Routes de redirection /r/:clientId/:tagId
app.use('/admin', adminRoutes);      // Administration /admin/reload
app.use('/', signupRoutes);          // Inscription /signup et /api/signup

// ===== GESTION DES ERREURS 404 =====
app.use((req, res) => {
    res.status(404).send(`
        <h2>404 - Page non trouvée</h2>
        <p>La page que vous cherchez n'existe pas.</p>
        <p><a href="/signup">Retour à l'inscription</a></p>
    `);
});

// ===== GESTION DES ERREURS SERVEUR =====
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).send(`
        <h2>500 - Erreur serveur</h2>
        <p>Une erreur est survenue. Veuillez réessayer plus tard.</p>
        <p><a href="/signup">Retour à l'inscription</a></p>
    `);
});

// ===== DÉMARRAGE DU SERVEUR =====
app.listen(port, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 NFC FORWARDER DÉMARRÉ');
    console.log('='.repeat(60));
    console.log(`📡 Port: ${port}`);
    console.log(`🔗 URL: http://localhost:${port}`);
    console.log(`📝 Routes disponibles:`);
    console.log(`   - Accueil: / (redirige vers /signup)`);
    console.log(`   - Inscription: /signup`);
    console.log(`   - API: /api/signup`);
    console.log(`   - Admin: /admin/reload`);
    console.log(`   - Redirection: /r/test/%23NFC-001`);
    console.log(`📁 Fichiers statiques: /public`);
    console.log('='.repeat(60) + '\n');
});