let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let logging = require('./functions/logging');
let fs = require('fs');
let config = require('./config.json');

let api = require('./routes/api');
let index = require('./routes/index');
let pageEdit = require('./routes/pageEdit');
let auth = require('./routes/auth');
let upload = require('./routes/upload');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(require('express-session')({ resave: false, saveUninitialized: false, secret: 'a secret' }));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/plant-profiles/images/:name', auth.auth, function(req, res, next) {
    res.contentType('image/jpeg');
    res.setHeader('Cache-Control', 'no-store');
    fs.readFile(`../Site/public/images/plantprofiles/${req.params.name}.jpg`, function(err, data) {
        res.end(data);
    });
});

app.use('/api', api);
app.use('/page-edit', pageEdit);
app.use('/auth', auth.pages);
app.use('/upload', upload);
app.use('/', index);

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