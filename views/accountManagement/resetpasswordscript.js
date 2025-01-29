document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/verifytoken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        document.getElementById('loading').style.display = 'none';
        
        if (data.valid) {
            document.getElementById('form-container').style.display = 'block';
        } else {
            document.getElementById('error-container').style.display = 'block';
        }
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-container').style.display = 'block';
    }
});

async function confirmPassword() {
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    if (password !== password2) {
        alert('Les mots de passe ne correspondent pas.');
        return;
    }

    if (password.length < 8) {
        alert('Le mot de passe doit contenir au moins 8 caractères.');
        return;
    }

    try {
        const response = await fetch('/api/newpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                token,
                password 
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Votre mot de passe a été mis à jour avec succès.');
            window.location.href = '/login';
        } else {
            alert('Une erreur est survenue. Veuillez réessayer.');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
}