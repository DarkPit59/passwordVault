const crypto = require('crypto');
const config = require('../../config/configLocal');
const { pool } = require('../../config/dbConfigLocal');
const mailer = require('./sendMail');

async function encryptDataWithKey(dataToProcess, key){
    try {
        const iv1 = crypto.randomBytes(16);
        const key1 = crypto.scryptSync(key, 'salt', 32);
        const cipher1 = crypto.createCipheriv('aes-256-cbc', key1, iv1);
        let encrypted = cipher1.update(dataToProcess, 'utf8', 'hex');
        encrypted += cipher1.final('hex');
        encrypted = iv1.toString('hex') + ':' + encrypted;

        return encrypted;

    } catch (error) {
        console.error('Erreur lors du cryptage des données :', error);
        throw error;
    }
}

async function decryptDataWithKey(dataToProcess, key){
    try {
        const [iv2Hex, encryptedData2] = dataToProcess.split(':');
        const iv2 = Buffer.from(iv2Hex, 'hex');
        const key2 = crypto.scryptSync(key, 'salt', 32);
        const decipher2 = crypto.createDecipheriv('aes-256-cbc', key2, iv2);
        let decrypted = decipher2.update(encryptedData2, 'hex', 'utf8');
        decrypted += decipher2.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Erreur lors du décryptage des données :', error);
        throw error;
    }
}

async function encryptPassword(password, hashpass) {
    try {
        // Première étape : cryptage avec la clé secrète
        let passwordSecret = encryptDataWithKey(password, config.secret);

        // Deuxième étape : cryptage avec le hash de l'utilisateur
        let cryptedPassword = encryptDataWithKey(passwordSecret, hashpass);

        return cryptedPassword;
    } catch (error) {
        console.error('Erreur lors du cryptage du mot de passe:', error);
        throw error;
    }
}

async function decryptPassword(cryptedPassword, hashpass) {
    try {
        // Première étape : décryptage avec le hash utilisateur
        let passwordSecret = decryptDataWithKey(cryptedPassword, hashpass);
        // Deuxième étape : décryptage avec la clé secrète
        let password = decryptDataWithKey(passwordSecret, config.secret);

        return password;
    } catch (error) {
        console.error('Erreur lors du décryptage du mot de passe:', error);
        throw error;
    }
}

/*async function encryptUserData(data) {
    try {
        // Récupération des données depuis l'objet data
        const { mail, pseudonyme } = data;

        // Chiffrement des données
        const encryptedMail = await encryptDataWithKey(mail, config.secret);
        const encryptedNick = await encryptDataWithKey(pseudonyme, config.secret);

        return {pseudonyme: encryptedNick, mail: encryptedMail};

    } catch (error) {
        console.error('Erreur lors du chiffrement des données:', error);
        return {pseudonyme: "", mail: ""};
    }
}*/

async function readCryptedUserData(userid) {
    try {
        // Récupération du mail et du pseudonyme depuis la BDD
        const userData = await pool.query(
            'SELECT pseudonyme, mail FROM pwdvaultUsers WHERE id = ?',
            [userid]
        );

        if (userData.length === 0) {
            throw new Error('Utilisateur non trouvé');
        }

        const { pseudonyme, mail } = userData[0];

        // Chiffrement des données
        const decryptedMail = await encryptDataWithKey(mail, config.secret);
        const decryptedNick = await encryptDataWithKey(pseudonyme, config.secret);

        return {pseudonyme: decryptedNick, mail: decryptedMail};

    } catch (error) {
        console.error('Erreur lors du chiffrement des données:', error);
        return {pseudonyme: "", mail: ""};
    }
}

async function validateMail (mail) {
    try {        
        // Vérification de l'existence du mail dans la BDD
        const user = await pool.query(
            'SELECT id FROM pwdvaultUsers WHERE mail = ?',
            [mail]
        );
        console.log(`mail : ${mail}`);
        console.log(`user : ${user}`);
        if (user.length === 0) {
            return false;
        }

        return true;

    } catch (error) {
        console.error('Erreur lors de la vérification du mail:', error);
        return false;
    }
}

async function verifyToken (req, res) {
    const { token } = req.body;
    try {
        
        const result = await pool.query(
            `SELECT * 
            FROM pwdvaultUsers 
            WHERE reset_token = ? 
                AND reset_token_expires > CURRENT_TIMESTAMP 
                AND reset_token IS NOT NULL`,
            [token]
        );

        return res.json({ 
            valid: result.length > 0 
        });

    } catch (error) {
        console.error(`Erreur lors de la vérification du token ${token} : ${error}`);
        return res.status(500).json({ 
            valid: false, 
            error: 'Erreur serveur' 
        });
    }
}

async function sendMail (req, res) {
    try {
        const { mail } = req.body;
        const isValid = await validateMail(mail);
        if (!isValid) {
            return res.render('views/accountManagement/confirm', { 
                message: 'Cette adresse email n\'est pas enregistrée dans notre base de données.' 
            });
        }
        const result = await mailer.sendMail(mail);
        if (!result) {
            return res.render('views/accountManagement/confirm', { 
                message: 'Une erreur est survenue lors de l\'envoi du mail.' 
            });
        }
        return res.render('views/accountManagement/confirm', { 
            message: 'Un mail de réinitialisation a été envoyé à votre adresse email.' 
        });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du mail:', error);
        return res.render('views/accountManagement/confirm', { 
            message: 'Une erreur est survenue lors du changement de mot de passe.' 
        });
    }
}

//changer le mot de passe via le formulaire
async function updatePassword (req, res) {
    try {
        const { currentPassword, password, passwordConfirm } = req.body;
        const { id } = req.session.user;
        // Vérifier si les deux mots de passe sont identiques
        if (password !== passwordConfirm) {
            return res.render('views/dashboard/change', { 
                message: 'Les deux mots de passe ne correspondent pas.' 
            });
        }

        // hasher le mot de passe actuel
        const hashedCurrentPassword = crypto
            .createHmac('sha256', config.secret)
            .update(currentPassword)
            .digest('hex');

        // Vérifier si le mot de passe actuel est correct
        const user = await pool.query(
            'SELECT * FROM pwdvaultUsers WHERE id = ? AND hashpass = ?',
            [id, hashedCurrentPassword]
        );

        if (user.length === 0) {
            return res.render('views/dashboard/change', { 
                message: 'Le mot de passe actuel est incorrect.' 
            });
        }

        // Hasher le mot de passe avec la clé secrète
        const hashedPassword = crypto
            .createHmac('sha256', config.secret)
            .update(password)
            .digest('hex');


        // Mettre à jour le mot de passe et réinitialiser le token
        await pool.query(
            'UPDATE pwdvaultUsers SET hashpass = ? WHERE id = ?',
            [hashedPassword, id]
        );

        return res.render('views/dashboard/change', { 
            message: 'Mot de passe modifié avec succès !' 
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        return res.render('views/dashboard/change', { 
            message: 'Une erreur est survenue lors du changement de mot de passe. Aucune modification effectuée. Veuillez réessayer ultérieurement.' 
        });
    }
}

//changer le mot de passe via le token
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

        return res.render('views/accountManagement/confirm', { 
            message: 'Mot de passe modifié avec succès !' 
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        return res.render('views/accountManagement/confirm', { 
            message: 'Une erreur est survenue lors du changement de mot de passe.' 
        });
    }
}

async function createAccount (req, res) {
    try {
        const { username, email, password } = req.body;

        const cryptedMail = await encryptDataWithKey(email, config.secret);
        // Vérifier si l'email existe déjà
        const emailExists = await pool.query(
            'SELECT * FROM pwdvaultUsers WHERE mail = ?',
            [cryptedMail]
        );

        if (emailExists.length > 0) {
            return res.render('views/accountManagement/confirm', { 
                message: 'Cette adresse email est déjà utilisée.' 
            });
        }

        const cryptedName = await encryptDataWithKey(username, config.secret);
        // Vérifier si le pseudonyme existe déjà
        const usernameExists = await pool.query(
            'SELECT * FROM pwdvaultUsers WHERE pseudonyme = ?',
            [cryptedName]
        );

        if (usernameExists.length > 0) {
            return res.render('views/accountManagement/confirm', { 
                message: 'Ce nom d\'utilisateur est déjà utilisé.' 
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
            [cryptedMail, cryptedName, hashedPassword]
        );

        return res.render('views/accountManagement/confirm', { 
            message: 'Compte créé avec succès !' 
        });

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        return res.render('views/accountManagement/confirm', { 
            message: 'Une erreur est survenue lors de la création du compte.' 
        });
    }
}

async function deleteAccount (req, res) {
    try {
        const { id, currentPassword } = req.body;

        // Vérifier si le mot de passe actuel est correct
        const hashedCurrentPassword = crypto
            .createHmac('sha256', config.secret)
            .update(currentPassword)
            .digest('hex');

        // Vérifier si le mot de passe actuel est correct
        const user = await pool.query(
            'SELECT * FROM pwdvaultUsers WHERE id = ? AND hashpass = ?',
            [id, hashedCurrentPassword]
        );

        if (user.length === 0) {
            return res.render('views/accountManagement/confirm', { 
                message: 'Le mot de passe actuel est incorrect. La suppression du compte n\'a pas été effectuée.' 
            });
        }

        await pool.query('DELETE FROM pwdvaultUsers WHERE id = ?', [id]);
        return res.render('views/accountManagement/confirm', { 
            message: 'Compte supprimé avec succès !' 
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        return res.render('views/accountManagement/confirm', { 
            message: 'Une erreur est survenue lors de la suppression du compte.' 
        });
    }
}  

async function login (req, res) {
    try {
        const { username, password } = req.body;

        // Création du hash avec le mot de passe fourni et la clé secrète
        const hash = crypto
            .createHmac('sha256', config.secret)
            .update(password)
            .digest('hex');

        const cryptedName = await encryptDataWithKey(username, config.secret);
        // Recherche de l'utilisateur dans la base de données
        const result = await pool.query(
            'SELECT * FROM pwdvaultUsers WHERE pseudonyme = $1 AND hashpass = $2',
            [cryptedName, hash]
        );
        // console.log(result);
        if (result.length > 0) {
            // Authentification réussie
            const pseudonyme = await decryptDataWithKey(result[0].pseudonyme, config.secret);
            const mail = await decryptDataWithKey(result[0].mail, config.secret);
            req.session.user = {
                id: result[0].id,
                username: pseudonyme,
                email: mail,
                hashpass: result[0].hashpass
            };
            res.redirect('/dashboard'); // Redirection vers le tableau de bord
        } else {
            return res.render('views/accountManagement/confirm', { 
                message: 'Identifiants incorrects.' 
            });
        }

    } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        return res.render('views/accountManagement/confirm', { 
            message: 'Une erreur est survenue lors de la connexion.' 
        });
    }
}

// déconnexion
async function logout(req, res) {
    try {
        // Détruire la session
        req.session.destroy((err) => {
            if (err) {
                console.error('Erreur lors de la déconnexion:', err);
                return res.render('views/accountManagement/confirm', { 
                    message: 'Erreur lors de la déconnexion.' 
                });
            }
            return res.render('views/accountManagement/confirm', { 
                message: 'Déconnexion réussie !' 
            });
        });

    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        return res.render('views/accountManagement/confirm', { 
            message: 'Une erreur est survenue lors de la déconnexion.' 
        });
    }
}

async function seeMyData (req, res) {
    try {
        const { id, hashpass } = req.session.user;
        const result = await pool.query(
            'SELECT * FROM pwdvaultData WHERE userid = ?',
            [id]
        );
        
        // Décrypter les mots de passe pour chaque entrée
        const decryptedResults = await Promise.all(result.map(async (row) => {
            return {
                ...row,
                account: await decryptDataWithKey(row.account, config.secret),
                password: await decryptPassword(row.cryptedPassword, hashpass)
            };
        }));
        
        return decryptedResults;
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return [];
    }
}

async function saveData(req, res) {
    try {
        const { id, hashpass } = req.session.user;
        
        // Vérifier si les données sont dans un tableau ou dans req.body directement
        const dataToProcess = Array.isArray(req.body) ? req.body : [req.body];
        
        // Validation des données
        if (!dataToProcess || dataToProcess.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Aucune donnée reçue' 
            });
        }
        
        // Traiter chaque entrée
        for (const item of dataToProcess) {
            const { account, password } = item;
            
            if (!account || !password) {
                continue;
            }
            
            const cryptedPassword = await encryptPassword(password, hashpass);
            const cryptedAccount = await encryptDataWithKey(account, config.secret);
            
            await pool.query(
                'INSERT INTO pwdvaultData (userid, account, cryptedPassword) VALUES (?, ?, ?)',
                [id, cryptedAccount, cryptedPassword]
            );
        }
        
        return res.json({ 
            success: true, 
            message: 'Données sauvegardées avec succès' 
        });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la sauvegarde des données' 
        });
    }
}

async function deleteData(req, res) {
    try {
        const { id } = req.session.user;
        const { ids } = req.body;
        
        // Vérification que ids est bien un tableau non vide
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.json({ 
                success: false,
                message: 'Aucun élément à supprimer'
            }); 
        }

        // Création des placeholders (?) pour chaque ID
        const placeholders = ids.map(() => '?').join(',');

        // La requête avec les placeholders dynamiques
        const result = await pool.query(
            `DELETE FROM pwdvaultData WHERE id IN (${placeholders}) AND userid = ?`,
            [...ids, id] // Spread les IDs et ajoute l'userid à la fin
        );
        
        return res.json({ 
            success: true,
            message: 'Données supprimées avec succès !'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression des données : ', error);
        return res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la suppression des données. Aucune donnée supprimée.'
        });
    }
}

module.exports = { 
    verifyToken, 
    sendMail,
    login, 
    createAccount, 
    deleteAccount,
    changePassword, 
    updatePassword,
    logout,
    seeMyData,
    saveData,
    deleteData
};