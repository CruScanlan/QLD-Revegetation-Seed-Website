let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('aboutus', { title: 'About Us', subTitle: '' });
});

module.exports = router;
