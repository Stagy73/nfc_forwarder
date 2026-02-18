const express = require('express');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialiser Notion
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Rendre notion accessible dans toutes les routes
app.locals.notion = notion;

// Importer les routes
const homeRoutes = require('./routes/home');
const redirectRoutes = require('./routes/redirect');
const adminRoutes = require('./routes/admin');
const signupRoutes = require('./routes/signup');

// Utiliser les routes
app.use('/', homeRoutes);           // Page d'accueil
app.use('/', redirectRoutes);        // Routes de redirection
app.use('/admin', adminRoutes);      // Administration
app.use('/', signupRoutes);          // Inscription

// Démarrer le serveur
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 NFC FORWARDER DÉMARRÉ');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${port}`);
    console.log(`🔗 URL: http://localhost:${port}`);
    console.log(`📝 Routes disponibles:`);
    console.log(`   - Accueil: /`);
    console.log(`   - Inscription: /signup`);
    console.log(`   - Admin: /admin/reload`);
    console.log(`   - Redirection: /r/test/%23NFC-001`);
    console.log('='.repeat(50) + '\n');
});