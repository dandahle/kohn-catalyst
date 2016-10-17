var express = require('express');
var favicon = require('serve-favicon');
var db = require('./mongoose/index');
var request = require('request');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var fs = require('fs');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Define routes that will be used
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var routes = require('./routes/index');
var test = require('./routes/test');
var view = require('./routes/view')
var miketest = require('./routes/miketest');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Start Express and view engines
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var app = express();
app.use(favicon(__dirname + '/public/images/favicon.ico'));


// Setup view engine
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Use any middleware for the application that is needed
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Example that logs request IP to console
app.use(function(req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip.replace(/^.*:/, '')
    console.log('Client IP:', ip);
    next();
});
app.use(function(req, res, next) {
    console.log('Request type:', req.method);
    next();
});


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Use routes now that app has been initiated and all middleware is defined
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
app.use('/', routes);
app.use('/test', test); // This route handles all examples in test (restaurant) DB
app.use('/mt', miketest); // SHOULD route to mike's test miketest.js
app.use('/applications', view);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Error handlers
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// 4XX Code
// 400 - Bad request
app.use(function(req, res, next) {
    var err = new Error('Bad request');
    err.status = 400;
    next(err);
});

// 401 - Unauthorized
app.use(function(req, res, next) {
    var err = new Error('Unauthorized');
    err.status = 401;
    next(err);
});

// 404 - Not found
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler, will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler, no stacktrace leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;