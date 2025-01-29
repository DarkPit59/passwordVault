const express = require('express');
const router = express.Router();
const api = require('../../admin/controllers/api');

router.get('/', async (req, res) => {
    try {
        // Appel direct à la fonction seeMyData avec req et res
        const data = await api.seeMyData(req, res);
        res.render('views/dashboard/consulter', { data });
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.render('views/dashboard/consulter', { data: [] });
    }
});

module.exports = router;