var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var session = require('express-session');
var userUtils = require('./users/LocalUserHelper').Utils;


var app = express();
app.use(cors());
app.use(session({ secret: 'wedo.wedo.wedo', resave: true, saveUninitialized: true, cookie: { secure: false } }));
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser('wedo.wedo.wedo'));
//app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'public')));

app.locals.dateformat = require('dateformat');

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => res.send("Welcome "+req.query.username+"!!"));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  //console.log("APP::serializeUser::user="+JSON.stringify(user));
  cb(null, user.username);
});

passport.deserializeUser(function(id, cb) {
  //console.log("APP::deserializeUser::id="+id);
  var user = userUtils.getUser(id);
  //console.log("APP::deserializeUser::user="+JSON.stringify(user));
  return cb(null, user);
});

/* PASSPORT LOCAL AUTHENTICATION */
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  function(username, password, done) {
    var user = userUtils.login(username,password);
    if(user.error) {
      return done(null, false);
    } else {
      return done(null, user);
    }
  }
));

app.get('/login', (req, res) => res.sendFile('auth.html', { root : __dirname}));
app.use('/doLogin',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    var url = "/tracker/index";
    if (req.session) {
      url = req.session.loginOriginalUrl;
      if( !url || url.startsWith("/tracker/") ) {
        url = "/tracker/index";
      }
    }
    res.redirect(url);
});
app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/login');
});

function ensureAuthenticated(req, res, next) {
  const url = req.originalUrl;
  //console.log("APP::ensureAuthenticated::url="+url);
  req.session.loginOriginalUrl = url;
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.set('view engine', 'ejs');


var users = require('./users/users');
app.use('/users', users);


var proxy = require('./wedotracking/proxy');
var po = require('./wedotracking/po');
var qr = require('./wedotracking/qr');
var sn = require('./wedotracking/sn');
var shipment = require('./wedotracking/shipment');
var transport = require('./wedotracking/transport');
var custodian = require('./wedotracking/custodian');



app.use('/proxy', proxy);
app.use('/po', po);
app.use('/qr', qr);
app.use('/sn', sn);
app.use('/shipment', shipment);
app.use('/transport', transport);
app.use('/custodian', custodian);


app.use('/tracking', express.static(path.join(__dirname, 'tracking')));
app.use('/track', ensureAuthenticated, express.static(path.join(__dirname, 'track')));

var trackRoutes = require('./wedotracking/trackRoutes');
app.use('/tracker', ensureAuthenticated, trackRoutes);


//MobileApp functions
var blockchainMobile = require('./blockchain/mobileApp');
app.use('/blockchain/mobileApp', blockchainMobile);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(500).send(err.message);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(500).send(err.message);
});

module.exports = app;
