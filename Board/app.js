var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var methodOverride = require('method-override');
var passport = require('passport');

var configAuth = require('./config/auth');
var index = require('./routes/index');
var users = require('./routes/users');
var board = require('./routes/board');
var routeAuth = require('./routes/auth');

var app = express();
app.io = require('socket.io')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// mongodb connect
mongoose.connect('mongodb://localhost:27017/board');
mongoose.connection.on('error', console.log);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(methodOverride('_method', {methods: ['POST', 'GET']}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(path.join(__dirname, '/bower_components')));

// Session Setting
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'long-long-long-secret-string-1313513tefgwdsvbjkvasd'
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.flashMessages = req.flash();
  next();
});

configAuth(passport); 

app.use('/', index);
app.use('/users', users);
app.use('/board', board);
routeAuth(app, passport);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
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

app.io.on('connection', function(socket){
  socket.on('connection_send', function(roomName, user){
    socket.join(roomName);
    socket.roomName = roomName;
    socket.user = user;

    var message = socket.user  + ' 입장했습니다.';
    app.io.sockets.in(socket.roomName).emit('message_receive', message);
  });
  socket.on('message_send', function(text){
    var message = socket.user  + ' : ' + text;
    app.io.sockets.in(socket.roomName).emit('message_receive', message);
  });
  socket.on('leave_send', function(){
    var message = socket.user  + ' 나갔습니다.';
    app.io.sockets.in(socket.roomName).emit('message_receive', message);
    socket.leave(socket.roomName);
  });
});

module.exports = app;
