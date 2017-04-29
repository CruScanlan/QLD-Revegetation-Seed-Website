let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('links', { title: 'Links', subTitle: '' });
});

module.exports = router;
