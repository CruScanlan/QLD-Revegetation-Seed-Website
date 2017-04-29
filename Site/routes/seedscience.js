let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('seedscience', { title: 'Seed Science', subTitle: '' });
});

module.exports = router;
