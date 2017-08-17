var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
//引入数据库配置文件
var setting = require('./setting');
//临时存放一些数据
var flash = require('connect-flash');
//支持会话
var session = require('express-session');
//把会话保存在mongodb中去
var Mongostore = require('connect-mongo')(session);
var app = express();

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
//使用flash
app.use(flash());
//将session保存在MongoDB里面
app.use(session({
    secret:'lpjBlog',
    key:setting.db,
    cookie:{maxAge:30*24*60*60*1000},
    store:new Mongostore({url:'mongodb://localhost/lipengjie'}),
    resave:false,
    saveUninitialized:true
}));

routes(app)

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

app.listen(3000,function () {
    console.log("node is ok")
})

module.exports = app;
