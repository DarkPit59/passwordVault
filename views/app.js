const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('../config/configLocal');
const checkAuth = require('../middleware/auth.middleware');


module.exports = (app) => {
    // Configuration du moteur de template
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '..')); // Pointe vers la racine du projet

    // Middlewares
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({
        secret: config.secret,
        resave: false,
        saveUninitialized: true
    }));

    // Middleware pour parser le JSON
    app.use(express.json());
    app.use(express.urlencoded({ extended: true })); 

    // Ajout du middleware d'authentification
    app.use(checkAuth);
};