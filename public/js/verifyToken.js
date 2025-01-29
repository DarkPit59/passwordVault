async function verifyUserToken() {
    // Récupération du token depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    try {
        // Appel à l'API pour vérifier le token
        const response = await fetch('/api/verifytoken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        // Masquer le message de chargement
        document.getElementById('loading').style.display = 'none';

        if (data.valid) {
            // Si le token est valide, afficher le formulaire
            document.getElementById('form-container').style.display = 'block';
        } else {
            // Si le token est invalide, afficher le message d'erreur
            document.getElementById('error-container').style.display = 'block';
        }
    } catch (error) {
        // En cas d'erreur, afficher le message d'erreur
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-container').style.display = 'block';
        console.error(`Erreur lors de la vérification du token ${token} : ${error}`);
    }
}