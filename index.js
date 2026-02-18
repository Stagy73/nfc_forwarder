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
const redirectRoutes = require('./routes/redirect');
const adminRoutes = require('./routes/admin');
const signupRoutes = require('./routes/signup');

// Utiliser les routes
app.use('/', redirectRoutes);
app.use('/admin', adminRoutes);
app.use('/', signupRoutes);

// Démarrer le serveur
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 NFC FORWARDER DÉMARRÉ');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${port}`);
    console.log(`🔗 URL: https://nfc-forwarder.onrender.com`);
    console.log('='.repeat(50) + '\n');
});