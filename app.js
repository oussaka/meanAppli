var express = require('express');                 // create our app w/ express
var session = require('express-session');
// var mongoose = require('mongoose');               // mongoose for mongodb
// var database = require('./config/database');      // load the database config
var redis           =     require("redis");
var redisStore      =     require('connect-redis')(session);
var path = require('path');
var async = require("async");
var client = redis.createClient();
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));  // parse application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'shuuut!',
    // create new redis store.
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl :  260}),
    saveUninitialized: false,
    resave: false
}));

// configuration ===============================================================
/*mongoose.connect(database.url, function(err) { 
                  if(err) throw err;
                });   // connect to mongoDB database on modulus.io*/

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
