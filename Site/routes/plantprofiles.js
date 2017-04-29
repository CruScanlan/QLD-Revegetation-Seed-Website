let express = require('express');
let DB = require('../functions/db');
let logging = require('../functions/logging');
let router = express.Router();

let profiles = {};
getAllProfiles();

function getAllProfiles(){
    logging.logTime('Updating plant profile data');
    DB.getAllProfiles(function (err,result) {
        if(err) return logging.logTimeErr('Could not retrieve plant profiles from the database');
        profiles = [];

        for(let i=0; i<result.length; i++)  {
            let profile = {};

            profile.name = result[i].Plant_Name;
            profile.description = result[i].Plant_Description;
            profile.map = result[i].Map == 1;
            profile.pictures = [];
            for(let p=1; p<5; p++)  {
                if(result[i]['Photo_'+p] == null) continue;
                profile.pictures.push({
                    url: `/images/plantprofiles/${result[i].Plant_Name.split(' ').join('-')}${p}.jpg`,
                    caption: result[i]['Photo_'+p]+" | QLD Revegetation Seed"
                })
            }

            profiles.push(profile);
        }
    });
}

setInterval(function () {
    getAllProfiles();
},30000);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('plantprofiles', { title: 'Plant Profiles', subTitle: '', profiles:profiles });
});

module.exports = router;