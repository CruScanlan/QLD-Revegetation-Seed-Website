let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
const fs = require('fs');

let index = require('./routes/index');
let aboutus = require('./routes/aboutus');
let seedlist = require('./routes/seedlist');
let plantprofiles = require('./routes/plantprofiles');
let qa = require('./routes/qa');
let seedscience = require('./routes/seedscience');
let contactus = require('./routes/contactus');
let links = require('./routes/links');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/about-us', aboutus);
app.use('/seed-list', seedlist);
app.use('/plant-profiles', plantprofiles);
app.use('/quality-assurance', qa);
app.use('/seed-science', seedscience);
app.use('/contact-us', contactus);
app.use('/links', links);
app.use('/images/:image',function(){
    res.contentType('image/png');
    fs.readFile(`./public/images/${req.params.name}`, function(err, data) {
        res.end(data);
    });
});
app.use('/files/:name',function () {
    fs.readFile(`./public/files/${req.params.name}`, function(err, data) {
        res.end(data);
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
