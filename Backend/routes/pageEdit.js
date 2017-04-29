const auth = require('../routes/auth').auth;
const config = require('../config.json');
let path = require('path');
let express = require('express');
let router = express.Router();

router.use(express.static(path.join(__dirname, '../public')));

router.get('/plant-profiles', auth, function(req, res, next) {
    res.render('page-plantProfiles');
});

module.exports = router;