// Cache pour éviter de trop solliciter l'API Notion
let clientsCache = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ID de VOTRE base de configuration clients
const CONFIG_DATABASE_ID = "30b1a922-a668-8148-9b6f-d9699e74e1ef";

/**
 * Charge la configuration des clients depuis la base Notion
 * Utilise un cache de 5 minutes pour éviter de surcharger l'API
 */
async function loadClientsConfig(notion) {
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
            const name = page.properties["Nom du Client"]?.title[0]?.text?.content;
            const databaseId = page.properties["Database ID"]?.rich_text[0]?.text?.content;
            const columnName = page.properties["Colonne UID"]?.select?.name || "UID";
            
            return { name, databaseId, columnName };
        }).filter(client => client.name && client.databaseId);

        lastCacheUpdate = now;
        console.log(`✅ ${clientsCache.length} clients actifs chargés`);
        
        return clientsCache;
    } catch (error) {
        console.error('❌ Erreur lors du chargement de la configuration:', error.message);
        return clientsCache.length > 0 ? clientsCache : [];
    }
}

/**
 * Invalide le cache (après ajout d'un client)
 */
function invalidateCache() {
    clientsCache = [];
    lastCacheUpdate = 0;
    console.log('🗑️ Cache invalidé');
}

module.exports = {
    loadClientsConfig,
    invalidateCache,
    CONFIG_DATABASE_ID
};