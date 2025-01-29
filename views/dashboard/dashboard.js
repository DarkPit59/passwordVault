const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('views/dashboard/dashboard', {
        user: req.session.user
    });
});

module.exports = router;