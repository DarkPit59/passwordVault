const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('views/accountManagement/confirm');  // Chemin relatif depuis le dossier views
});

module.exports = router;