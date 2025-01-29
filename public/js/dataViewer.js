// Chargement initial des données
async function loadData() {
    try {
        const response = await fetch('/api/consulter');
        const data = await response.json();
        renderTable(data);
        updateDeleteButton();
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

function renderTable(data) {
    const tbody = document.getElementById('passwordTableBody');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="delete-checkbox"></td>
            <td>${item.account}</td>
            <td class="password-cell">
                <span class="password-dots">••••••••</span>
                <span class="password-clear">${item.password}</span>
            </td>
            <td class="hidden-id">${item.id}</td>
        `;
        tbody.appendChild(row);
    });
}

// Fonction pour ajouter une nouvelle ligne
function addNewLine() {
    const tbody = document.getElementById('passwordTableBody');
    const newRow = document.createElement('tr');
    newRow.classList.add('newline');
    
    newRow.innerHTML = `
        <td>
            <button onclick="removeNewLine(this)" class="btn-remove-line">×</button>
        </td>
        <td><input type="text" class="account-input" placeholder="Compte"></td>
        <td><input type="text" class="password-input" placeholder="Mot de passe"></td>
        <td class="hidden-id"></td>
    `;
    
    tbody.appendChild(newRow);
    document.getElementById('btn-save').disabled = false;
}

// Fonction pour supprimer une nouvelle ligne
function removeNewLine(button) {
    const row = button.closest('tr');
    row.remove();
    
    // Désactiver le bouton Enregistrer s'il n'y a plus de nouvelles lignes
    const hasNewLines = document.querySelectorAll('.newline').length > 0;
    document.getElementById('btn-save').disabled = !hasNewLines;
}

// Fonction pour sauvegarder les nouvelles lignes
async function saveNewLines() {
    const newLines = document.querySelectorAll('.newline');
    const dataToSave = [];

    newLines.forEach(line => {
        const account = line.querySelector('.account-input').value;
        const password = line.querySelector('.password-input').value;
        if (account && password) {
            dataToSave.push({ account, password });
        }
    });

    if (dataToSave.length > 0) {
        try {
            console.log('Données à envoyer:', dataToSave);
            const jsonData = JSON.stringify(dataToSave);
            console.log('Données JSON:', jsonData);
            
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: jsonData
            });

            const result = await response.json().catch(e => {
                console.error('Erreur parsing JSON response:', e);
                return null;
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, message: ${result?.message || 'Unknown error'}`);
            }

            console.log('Réponse reçue:', result);
            
            if (result?.success) {
                alert(result.message);
                location.reload();
            } else {
                alert(result?.message || 'Erreur inconnue lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Erreur détaillée lors de la sauvegarde:', error);
            alert('Une erreur est survenue lors de la sauvegarde');
        }
    }
}

// Fonction pour supprimer les lignes sélectionnées
async function deleteSelectedLines() {
    const checkedBoxes = document.querySelectorAll('.delete-checkbox:checked');
    
    if (checkedBoxes.length === 0) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer les éléments sélectionnés ?')) {
        try {
            const idsToDelete = Array.from(checkedBoxes).map(checkbox => 
                checkbox.closest('tr').querySelector('.hidden-id').textContent
            );
            console.log('IDs à supprimer:', idsToDelete);
            const response = await fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: idsToDelete })
            });

            const result = await response.json();
            
            alert(result.message); // Affiche le message de succès ou d'erreur
            
            if (result.success) {
                location.reload();
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Une erreur est survenue lors de la suppression');
        }
    }
}

// Gestion de l'affichage des mots de passe
document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('password-dots')) {
        e.target.style.display = 'none';
        e.target.nextElementSibling.style.display = 'inline';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('password-clear')) {
        e.target.style.display = 'none';
        e.target.previousElementSibling.style.display = 'inline';
    }
});

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('password-clear')) {
        navigator.clipboard.writeText(e.target.textContent);
        alert('Mot de passe copié dans le presse-papier');
    }
});

// Ajouter cette fonction pour mettre à jour l'état du bouton de suppression
function updateDeleteButton() {
    const checkedBoxes = document.querySelectorAll('.delete-checkbox:checked');
    const deleteButton = document.querySelector('.btn-delete');
    deleteButton.disabled = checkedBoxes.length === 0;
}

// Ajouter un écouteur d'événements pour les cases à cocher
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('delete-checkbox')) {
        updateDeleteButton();
    }
});