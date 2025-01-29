import { sendMail } from './sendMail';

async function newPwd(mail) {
    try {
        const response = await fetch('/api/validatemail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mail })
        });

        const data = await response.json();
        
        if (!data.success) {
            alert("Cette adresse mail n'est pas connue.");
            return;
        }

        if (sendMail(mail)) {
            alert("Un mail vous permettant de réinitialiser votre mot de passe a été envoyé");
            window.location.href = '/login';
            return;
        }        
        
    } catch (error) {
        alert("Une erreur est survenue. Veuillez réessayer plus tard.");
        return;
    }
}

module.exports = { newPwd };