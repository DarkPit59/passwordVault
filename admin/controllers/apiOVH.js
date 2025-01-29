const crypto = require('crypto');
const config = require('../../config/configOvh');
const { pool } = require('../../config/dbConfig');

async function validateMail (req, res) {
    try {
        const { mail } = req.body;
        
        // Vérification de l'existence du mail dans la BDD
        const user = await pool.query(
            'SELECT id FROM pwdvaultUsers WHERE mail = ?',
            [mail]
        );

        if (user.length === 0) {
            return res.json({ success: false });
        }

        return res.json({ success: true });

    } catch (error) {
        console.error('Erreur lors de la vérification du mail:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
}

async function verifyToken (req, res) {
    try {
        const { token } = req.body;
        
        const result = await pool.query(
            'SELECT * FROM pwdvaultUsers WHERE reset_token = ? AND reset_token_expires > NOW() AND reset_token IS NOT NULL',
            [token]
        );

        return res.json({ 
            valid: result.length > 0 
        });

    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        return res.status(500).json({ 
            valid: false, 
            error: 'Erreur serveur' 
        });
    }
}

async function changePassword (req, res) {
    try {
        const { token, password } = req.body;

        // Hasher le mot de passe avec la clé secrète
        const hashedPassword = crypto
            .createHmac('sha256', config.secret)
            .update(password)
            .digest('hex');

        // Mettre à jour le mot de passe et réinitialiser le token
        await pool.query(
            'UPDATE pwdvaultUsers SET hashpass = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?',
            [hashedPassword, token]
        );

        return res.json({ success: true });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
}

async function createAccount (req, res) {
    try {
        const { username, email, password } = req.body;

        // Vérifier si l'email existe déjà
        const emailExists = await pool.query(
            'SELECT * FROM pwdvaultUsers WHERE mail = ?',
            [email]
        );

        if (emailExists.length > 0) {
            return res.json({
                success: false,
                message: 'Cette adresse email est déjà utilisée'
            });
        }

        // Vérifier si le pseudonyme existe déjà
        const usernameExists = await pool.query(
            'SELECT * FROM pwdvaultUsers WHERE pseudonyme = ?',
            [username]
        );

        if (usernameExists.length > 0) {
            return res.json({
                success: false,
                message: 'Ce nom d\'utilisateur est déjà utilisé'
            });
        }

        // Hasher le mot de passe avec la clé secrète
        const hashedPassword = crypto
            .createHmac('sha256', config.secret)
            .update(password)
            .digest('hex');

        // Insérer le nouvel utilisateur
        await pool.query(
            'INSERT INTO pwdvaultUsers (mail, pseudonyme, hashpass) VALUES (?, ?, ?)',
            [email, username, hashedPassword]
        );

        return res.json({
            success: true,
            message: 'Compte créé avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
}

async function login (req, res) {
    try {
        const { username, password } = req.body;

        // Création du hash avec le mot de passe fourni et la clé secrète
        const hash = crypto
            .createHmac('sha256', secret)
            .update(password)
            .digest('hex');

        // Recherche de l'utilisateur dans la base de données
        const query = {
            text: 'SELECT * FROM pwdvaultUsers WHERE pseudonyme = $1 AND hashpass = $2',
            values: [username, hash]
        };

        const result = await pool.query(query);

        if (result.rows.length > 0) {
            // Authentification réussie
            req.session.user = {
                id: result.rows[0].id,
                username: result.rows[0].pseudonyme,
                email: result.rows[0].mail,
                hashpass: result.rows[0].hashpass
            };
            res.redirect('/dashboard'); // Redirection vers le tableau de bord
        } else {
            // Échec de l'authentification
            res.render('login', { error: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }

    } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        res.render('login', { error: 'Une erreur est survenue lors de la connexion' });
    }
}

// déconnexion
async function logout(req, res) {
    try {
        // Détruire la session
        req.session.destroy((err) => {
            if (err) {
                console.error('Erreur lors de la déconnexion:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erreur lors de la déconnexion' 
                });
            }
            
            // Rediriger vers la page de login
            res.json({ 
                success: true, 
                redirect: '/login' 
            });
        });

    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur' 
        });
    }
}

module.exports = {
    validateMail, 
    verifyToken, 
    login, 
    createAccount, 
    changePassword, 
    logout
};