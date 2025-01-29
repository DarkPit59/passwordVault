document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[action="/api/updatePassword"]');
    const updateButton = document.getElementById('update-password');
    const inputs = form.querySelectorAll('input[type="password"]');

    // Empêcher la soumission si le bouton est désactivé
    form.addEventListener('submit', function(e) {
        if (updateButton.classList.contains('disabled')) {
            e.preventDefault();
        }
    });

    // Vérifier les champs à chaque modification
    inputs.forEach(input => {
        input.addEventListener('input', checkFields);
    });

    function checkFields() {
        const currentPassword = form.querySelector('input[name="currentPassword"]').value;
        const password = form.querySelector('input[name="password"]').value;
        const passwordConfirm = form.querySelector('input[name="passwordConfirm"]').value;

        if (currentPassword && password && passwordConfirm) {
            updateButton.classList.remove('disabled');
        } else {
            updateButton.classList.add('disabled');
        }
    }
});
