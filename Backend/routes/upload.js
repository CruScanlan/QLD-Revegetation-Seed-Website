const auth = require('../routes/auth').auth;
let fs = require('fs');
let path = require('path');
let express = require('express');
let router = express.Router();
let multer  = require('multer');
let storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './uploads'); // set the destination
    },
    filename: function(req, file, callback){
        callback(null, `${Date.now()}.jpg`); // set the file name and extension
    }
});


router.post('/images/plant-profiles', auth, function(req, res){
    let upload = multer({ storage: storage }).single('image');
    upload(req,res,function(uploadErr) {
        fs.rename(path.join(__dirname, `../uploads/${req.file.filename}`), path.join(__dirname, `../../Site/public/images/plantprofiles/${req.body.name}.jpg`), function(renameErr) {
            if(uploadErr || renameErr) return res.json({err:true});
            return res.json({err:false});
        });
    });
});

module.exports = router;