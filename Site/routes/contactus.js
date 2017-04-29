const express = require('express');
const router = express.Router();
const config = require('../config.json');
const twilio = require('twilio')(config.twilio.id,config.twilio.token);
const helper = require('sendgrid').mail;
const request = require('request');
const sendgrid = require('sendgrid')(config.sendgrid);

const secret = "6LctoxgUAAAAAPJImbx4alJUlpbelJhUG8JqsmJk";

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('contactus', { title: 'Contact Us', subTitle: '', messageSent: "" });
});

router.post('/',function (req, res) {

    verifyRecaptcha(req.body["g-recaptcha-response"], function(success) {
        if(success) {
            let from_email = new helper.Email('website@qldrevegetationseed.com');
            let to_email = new helper.Email('info@qldrevegetationseed.com');
            let subject = 'Website Contact Form Submission';
            let content = new helper.Content('text/plain', `There was a contact form submission on your website,
            Name: ${req.body.Name}
    
            Company: ${req.body.Company}
    
            Phone: ${req.body.Phone}
    
            Email: ${req.body.Email}
    
            Message: ${req.body.Message}`);
            let mail = new helper.Mail(from_email, subject, to_email, content);

            let request = sendgrid.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON(),
            });

            sendgrid.API(request, function(error, response) {
                if(error)   {
                    res.render('contactus', { title: 'Contact Us', subTitle: '',messageSent: {error:true} });
                }   else    {
                    res.render('contactus', { title: 'Contact Us', subTitle: '',messageSent: {error:false} });
                }
                twilio.messages.create({
                    to: '0448548453',
                    from: '+61481072516',
                    body: `There was a contact form submission on your website. Company: ${req.body.Company}`
                }, function(err, message) {

                });
            });
        }   else    {
            res.render('contactus', { title: 'Contact Us', subTitle: '',messageSent: {error:true} });
        }
    });

});

// Helper function to make API call to Recaptcha and check response
function verifyRecaptcha(key, callback) {
   request("https://www.google.com/recaptcha/api/siteverify?secret=" + secret + "&response=" + key, function (error, response, body) {
        if(!error && response.statusCode == 200)    {
            return callback(JSON.parse(body).success);
        }
        return callback();
    });
}

module.exports = router;