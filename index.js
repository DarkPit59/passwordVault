const express = require('express');
const app = express();
const config = require('./config/configLocal');
const port = config.port;

// Import de la configuration de l'app
require("./views/app")(app);  // Notez le passage de app en paramètre

// Import routes
const routes = require('./admin/routes/routes');
app.use('/', routes);

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).render('views/error', { 
        message: 'Page non trouvée' 
    });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('views/error', { 
        message: 'Une erreur est survenue' 
    });
});

// Seul endroit où app.listen est appelé
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});