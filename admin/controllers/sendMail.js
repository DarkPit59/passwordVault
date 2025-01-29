const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { pool } = require('../../config/dbConfigLocal');
const config = require('../../config/configOvh');

async function generateResetToken(mail) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 3600000); // Token valide 1 heure

    try {
        await pool.query(
            'UPDATE pwdvaultUsers SET reset_token = ?, reset_token_expires = ? WHERE mail = ?',
            [token, expiration, mail]
        );
        return token;
    } catch (error) {
        console.error('Erreur lors de la génération du token:', error);
        return null;
    }
}

async function sendMail(mail) {
    try {
        const token = await generateResetToken(mail);
        if (!token) return false;

        const transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: true,
            auth: {
                user: config.smtp.user,
                pass: config.smtp.pwd
            }
        });

        const resetLink = `${config.smtp.url}/resetpassword?token=${token}`;
        
        const mailOptions = {
            from: config.smtp.user,
            to: mail,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
                <h1>Réinitialisation de votre mot de passe</h1>
                <p>Vous avez demandé l'envoi d'un mail pour réinitialiser votre mot de passe.</p>
                <p>Par souci de sécurité, il nous est impossible de vous envoyer en clair votre mot de passe, celui-ci est stocké de manière cryptée dans notre base de données.</p>
                <p>En conséquence, il est nécessaire de définir un nouveau mot de passe.</p>
                <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
                <a href="${resetLink}">Réinitialiser mon mot de passe</a>
                <p>Ce lien est valable pendant 1 heure.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;

    } catch (error) {
        console.error('Erreur lors de l\'envoi du mail:', error);
        return false;
    }
}

module.exports = { sendMail };