const DB = require('./../functions/db');
const auth = require('../routes/auth').auth;
const config = require('../config.json');
const logging = require('../functions/logging');
let path = require('path');
let fs = require('fs');
let express = require('express');
let router = express.Router();

let profileImagesPath = path.join(__dirname, '../../Site/public/images/plantprofiles/');

router.get('/', function(req, res, next) {
    res.send('API Running');
});

router.get('/page-editor/plant-profiles/card-summary', auth, function(req, res, next) {
    if(!req.query.q == undefined) return res.send('Query Error');
    if(!req.query.p == undefined) return res.send('Query Error');
    if(!req.query.size == undefined) return res.send('Query Error');

    let skipNo = Number((req.query.p*req.query.size)-req.query.size);
    let returnNo = Number(req.query.size)+1;

    let DBRequest = {
        skipNo: skipNo,
        returnNo: returnNo,
        query: req.query.q.toLowerCase()
    };

    DB.getProfiles(DBRequest,function (err,result) {
        if(err) return res.json({err:true});

        let resultLength = result.rows.length;
        if(result.rows.length==returnNo) resultLength = result.rows.length-1;

        let finalProfileCards = "";
        for(let i=0; i<resultLength; i++){
            finalProfileCards = finalProfileCards+`
            <div class="col-sm-6 col-md-4">
              <div class="card card-accent-success">
                <div class="card-header">
                  ${result.rows[i].Plant_Name}
                </div>
                <div class="card-block">
                  <div class="profile-body">
                    ${result.rows[i].Plant_Description}
                  </div>
                  <div class="profile-footer center-horizontal">
                    <button type="button" class="btn btn-primary" onclick="openEditModal('${result.rows[i].Plant_Name}');"><i class="fa fa-edit fa-lg mt-2 button-icon"></i> Edit</button>
                    <button type="button" class="btn btn-danger" onclick="deleteProfile('${result.rows[i].Plant_Name}');"><i class="fa fa-trash fa-lg mt-2 button-icon"></i></button>
                  </div>
                </div>
              </div>
            </div>
            `
        }

        res.json({err:false,data:finalProfileCards,results:result.no,more:(result.rows.length==returnNo)});
    });
});

router.post('/page-editor/plant-profiles/add', auth, function(req, res, next) {
    let post = req.body;
    DB.addProfile(post,function (err) {
        res.json({err:err});
    });
});

router.post('/page-editor/plant-profiles/exists', auth, function(req, res, next) {
    let post = req.body;
    DB.getProfileByName(post.name.toLowerCase(), function (err,result) {
        if(err) return res.json({err:true});
        return res.json({err:false,exists:(result.length > 0)});
    })
});

router.post('/page-editor/plant-profiles/edit', auth, function(req, res, next) {
    let post = req.body;
    DB.editProfile(post,function (err) {
        if(err) return res.json({err:true});

        if(post.Plant_Name != post.Plant_Name_Current)  {
            return renameAllImages(1,profileImagesPath,post.Plant_Name_Current.split(' ').join('-'),post.Plant_Name.split(' ').join('-'),res)
        }
        return res.json({err:false});
    });
});

router.post('/page-editor/plant-profiles/edit-info', auth, function(req, res, next) {
    let post = req.body;
    DB.getProfileByName(post.name.toLowerCase(), function (err,result) {
        if(err) return res.json({err:true});
        return res.json({err:false,data:result[0]});
    })
});

router.post('/page-editor/plant-profiles/delete', auth, function(req, res, next) {
    let post = req.body;

    DB.getProfileByName(post.name.toLowerCase(), function (DBErr1,result) {
        if(DBErr1) return res.json({err:true,warn:false});

        DB.deleteProfile(req.body.name,function (DBErr2) {
            if(DBErr2) return res.json({err:true,warn:false});

            let photoPath = profileImagesPath+(result[0].Plant_Name.split(' ').join('-'));
            deleteallImages(1,photoPath,result[0],res);
        })
    });
});

router.post('/page-editor/plant-profiles/delete-photo', auth, function(req, res, next) {
    let no = Number(req.body.no);
    let name = req.body.name;
    let photoPath = profileImagesPath+(name.split(' ').join('-'));

    fs.open(photoPath+no+".jpg", 'r', (err) => {
        if(!err) {
            fs.unlink(photoPath+no+".jpg",function (err) {
                if(err) return res.json({err:true});
                deleteRenameAllImages(no+1,photoPath,res,name,no)
            });
        }   else    {
            imageDeleteDB(name,no,res);
        }
    });
});

function renameAllImages(image,path,oldName,newName,res) {
    if(image<5)    {
        fs.open(path+oldName+image+".jpg", 'r', (err) => {
            if(!err) {
                fs.rename(path+oldName+image+".jpg", path+newName+image+".jpg", function (err) {
                    if(err) return res.json({err:true});
                    renameAllImages(image+1,path,oldName,newName,res);
                });
            }   else    {
                return res.json({err:false});
            }
        });
    }   else    {
        return res.json({err:false});
    }
}

function deleteRenameAllImages(image,path,res,name,no){
    if(image<5)    {
        fs.open(path+image+".jpg", 'r', (err) => {
            if(!err) {
                fs.rename(path+image+".jpg", path+(image-1)+".jpg", function (err) {
                    if(err) return res.json({err:true});
                    deleteRenameAllImages(image+1,path,res,name,no);
                });
            }   else    {
                imageDeleteDB(name,no,res);
            }
        });
    }   else    {
        imageDeleteDB(name,no,res);
    }
}

function imageDeleteDB(name,no,res)    {
    DB.getProfileByName(name.toLowerCase(), function (err,result) {
        if(err) return res.json({err:true});
        result = result[0];

        let data = {};
        for(let i=1; i<4; i++)    {
            if(i < no) {
                data['Photo_'+i] = result['Photo_'+i];
                continue;
            }
            data['Photo_'+i] = result['Photo_'+(i+1)];
        }
        data.Photo_4 = null;
        data.Plant_Name = result.Plant_Name;

        DB.editProfilePhotos(data,function (err) {
            if(err) return res.json({err:true});
            DB.getProfileByName(name.toLowerCase(), function (err,result) {
                if(err) return res.json({err:true});
                return res.json({err:false,data:result[0]});
            });
        });
    });
}

function deleteallImages(image,path,db,res) {
    if(image<5) {
        if(db['Photo_'+String(image)] != null){
            let file = path+String(image)+'.jpg';
            fs.stat(file,function (err,exists) {
                if(err) return res.json({err:false,warn:true});
                if(exists)  {
                    fs.unlink(file,function (err) {
                        if(err) return res.json({err:false,warn:true});
                        deleteallImages(image+1,path,db,res);
                    })
                }   else    {
                    deleteallImages(image+1,path,db,res);
                }
            })
        }   else    {
            deleteallImages(image+1,path,db,res);
        }
    }   else    {
        return res.json({err:false,warn:false});
    }
}

module.exports = router;