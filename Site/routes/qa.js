let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('qa', { title: 'Quality Assurance', subTitle: '' });
});

module.exports = router;
