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
    getAllProfiles: function (callback) {
        let sql = "SELECT * FROM `QLDreveg`.`plantProfiles` ORDER BY `Plant_Name`";

        logging.logTime(`SQL Query | Get All Profiles | ${sql}`);
        connection.query(sql,function(err,rows) {
            if(err) {
                logging.logTimeErr(err);
                return callback(true);
            }
            return callback(false,rows);
        });
    }
};