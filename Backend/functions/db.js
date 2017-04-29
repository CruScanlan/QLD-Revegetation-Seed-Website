const mysql = require('mysql');
const logging = require('./logging');
const config = require('../config.json');

const connection = mysql.createConnection(config.mysql);

connection.connect(function(err) {
    if (err) {
        logging.logTime(`ERROR: Connecting to DB: ${err.stack}`);
        return;
    }
    logging.logTime(`Connected to DB`);
});

module.exports  =  {
    addProfile: function(data,callback){
        let map = data.map;
        let sql = "";
        let inserts = [];
        if(data.photos != undefined){
            if(data.photos.photo4 != undefined) {
                sql = "INSERT INTO `QLDreveg`.`plantProfiles` (`Plant_Name`, `Plant_Description`, `Map`, `Photo_1`, `Photo_2`,`Photo_3`, `Photo_4`) VALUES (?,?,?,?,?,?,?);";
                inserts = [data.name,data.description,map,data.photos.photo1,data.photos.photo2,data.photos.photo3,data.photos.photo4];
            }   else if(data.photos.photo3 != undefined)    {
                sql = "INSERT INTO `QLDreveg`.`plantProfiles` (`Plant_Name`, `Plant_Description`, `Map`, `Photo_1`, `Photo_2`,`Photo_3`) VALUES (?,?,?,?,?,?);";
                inserts = [data.name,data.description,map,data.photos.photo1,data.photos.photo2,data.photos.photo3];
            }   else if(data.photos.photo2 != undefined)    {
                sql = "INSERT INTO `QLDreveg`.`plantProfiles` (`Plant_Name`, `Plant_Description`, `Map`, `Photo_1`, `Photo_2`) VALUES (?,?,?,?,?);";
                inserts = [data.name,data.description,map,data.photos.photo1,data.photos.photo2];
            }   else {
                sql = "INSERT INTO `QLDreveg`.`plantProfiles` (`Plant_Name`, `Plant_Description`, `Map`, `Photo_1`) VALUES (?,?,?,?);";
                inserts = [data.name,data.description,map,data.photos.photo1];
            }
        }   else    {
            sql = "INSERT INTO `QLDreveg`.`plantProfiles` (`Plant_Name`, `Plant_Description`, `Map`) VALUES (?,?,?);";
            inserts = [data.name,data.description,map];
        }
        sql = mysql.format(sql, inserts);

        logging.logTime(`SQL Query | Add Profile | ${sql}`);
        connection.query(sql,function(err) {
            if(err) {
                logging.logTimeErr(err);
                return callback(true);
            }
            return callback(false);
        });
    },
    getProfileByName: function (name,callback) {
        let sql = "SELECT * FROM `QLDreveg`.`plantProfiles` WHERE LOWER(`Plant_Name`) = ?";
        let inserts = [name];
        sql = mysql.format(sql, inserts);

        logging.logTime(`SQL Query | Get Profile By Name | ${sql}`);
        connection.query(sql,function(err,rows) {
            if(err) {
                logging.logTimeErr(err);
                return callback(true);
            }
            return callback(false,rows);
        });
    },
    getProfiles: function (req,callback) {
        let sql = "";
        let inserts = [];
        if(req.query == "") {
            sql = "SELECT * FROM `QLDreveg`.`plantProfiles` ORDER BY `Plant_Name`";
        }   else    {
            sql = "SELECT * FROM `QLDreveg`.`plantProfiles` WHERE LOWER (`Plant_Name`) LIKE ? ORDER BY `Plant_Name`";
            inserts = ['%'+req.query+'%'];
            sql = mysql.format(sql, inserts);
        }

        if(req.size != 0 && req.p != 0) {
            sql = sql+" LIMIT ?,?";
            inserts = [req.skipNo,req.returnNo];
            sql = mysql.format(sql, inserts);
        }

        logging.logTime(`SQL Query | Get Profiles | ${sql}`);
        connection.query(sql,function(err,rows) {
            if (err) {
                logging.logTimeErr(err);
                return callback(true);
            }

            sql = "SELECT COUNT(*) FROM `QLDreveg`.`plantProfiles` WHERE LOWER (`Plant_Name`) LIKE ?";
            inserts = ['%'+req.query+'%'];
            sql = mysql.format(sql, inserts);

            logging.logTime(`SQL Query | Get No Of Profiles | ${sql}`);
            connection.query(sql, function (err, no) {
                if (err) {
                    logging.logTimeErr(err);
                    return callback(true);
                }

                return callback(false, {rows:rows,no:no[0]['COUNT(*)']});
            });
        });
    },
    editProfilePhotos: function (data,callback) {
        let sql = "UPDATE `QLDreveg`.`plantProfiles` SET `QLDreveg`.`plantProfiles`.`Photo_1` = ?, `QLDreveg`.`plantProfiles`.`Photo_2` = ?, `QLDreveg`.`plantProfiles`.`Photo_3` = ?, `QLDreveg`.`plantProfiles`.`Photo_4` = ? WHERE `QLDreveg`.`plantProfiles`.`Plant_Name` = ?;";
        let inserts = [data.Photo_1,data.Photo_2,data.Photo_3,data.Photo_4,data.Plant_Name];
        sql = mysql.format(sql, inserts);

        logging.logTime(`SQL Query | Edit Profile Photos | ${sql}`);
        connection.query(sql,function(err) {
            if(err) {
                logging.logTimeErr(err);
                return callback(true);
            }
            return callback(false);
        });
    },
    editProfile: function (data,callback) {
        let sql = "UPDATE `QLDreveg`.`plantProfiles` SET `QLDreveg`.`plantProfiles`.`Plant_Name` = ?, `QLDreveg`.`plantProfiles`.`Plant_Description` = ?, `QLDreveg`.`plantProfiles`.`Map` = ?";
        let inserts = [data.Plant_Name,data.Plant_Description,data.Map];

        for(let i=1; i<5; i++)  {
            if(data['Photo_'+i] != undefined) {
                sql=sql+", `QLDreveg`.`plantProfiles`.?? = ?";
                inserts.push('Photo_'+i);
                inserts.push(data['Photo_'+i]);
            }
        }

        sql +=" WHERE `QLDreveg`.`plantProfiles`.`Plant_Name` = ?;";
        inserts.push(data.Plant_Name_Current);
        sql = mysql.format(sql, inserts);

        logging.logTime(`SQL Query | Edit Profile | ${sql}`);
        connection.query(sql,function(err) {
            if(err) {
                logging.logTimeErr(err);
                return callback(true);
            }
            return callback(false);
        });
    },
    deleteProfile: function (name,callback) {
        let sql = "DELETE FROM `QLDreveg`.`plantProfiles` WHERE `QLDreveg`.`plantProfiles`.`Plant_Name` = ?;";
        let inserts = [name];
        sql = mysql.format(sql, inserts);

        logging.logTime(`SQL Query | Delete Profile | ${sql}`);
        connection.query(sql,function(err,rows) {
            if(err) {
                logging.logTimeErr(err);
                return callback(true);
            }
            return callback(false);
        });
    }
};