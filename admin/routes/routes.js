const express = require("express");
const api = require("../controllers/api");
const router = express.Router();

      // Import all your routes here. This is an example: create auth.route.js and import it here.

router.get('/', (req, res) => {
      if (req.session.user) {
            res.redirect('/dashboard');
      } else {
            res.redirect('/login');
      }
});

const login = require("../../views/accountManagement/login");
router.use("/login", login);

const register = require("../../views/accountManagement/register");
router.use("/register", register);

const forgotpwd = require("../../views/accountManagement/forgotpwd");
router.use("/forgotpwd", forgotpwd);

const resetpassword = require("../../views/accountManagement/resetpassword");
router.use("/resetpassword", resetpassword);

const dashboard = require("../../views/dashboard/dashboard");
router.use("/dashboard", dashboard);

const consulter = require("../../views/dashboard/consulter");
router.use("/consulter", consulter);

const parametres = require("../../views/dashboard/parametres");
router.use("/parametres", parametres);

// API routes

// vérification du token
router.post('/api/verifytoken', api.verifyToken);

// nouveaux mots de passe
router.post('/api/sendmail', api.sendMail);

// nouveaux mots de passe
router.post('/api/newpassword', api.changePassword);

// modification du mot de passe
router.post('/api/updatePassword', api.updatePassword);

// suppression du compte
router.post('/api/deleteAccount', api.deleteAccount);

// création d'un compte
router.post('/api/register', api.createAccount);

// connexion
router.post('/api/login', api.login);

// déconnexion
router.post('/api/logout', api.logout);

// consulter
router.get('/api/consulter', api.seeMyData);

// ajouter
router.post('/api/save', api.saveData);

// supprimer
router.post('/api/delete', api.deleteData);

module.exports = router;
