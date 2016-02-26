var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var errorHandler = require('errorHandler');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
// const MongoStore = require('connect-mongo')(session);
var db = require('./public/javascripts/db.js');

var login = require('./routes/login');
var index = require('./routes/index');

var app = express();

app.use(db());
app.use(session({
	secret: "secret",
	name: "mysession",
	proxy: true,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 60 * 10000
	}/*,
	 store: new MongoStore({
	 	url: 'mongodb://localhost/pwqSysu'
	 })*/
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'logo.ico')));
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', login);
app.use('/index', index);

var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
	app.use(errorHandler());
}

if (env === 'production') {
	// TODO
}

app.use(function(error, req, res, next) {
	if (!error) {
		next();
	} else {
		console.error(error.stack);
		res.send(500);
	}
});

var debug = require('debug')('my-application'); // debug模块
app.set('port', process.env.PORT || 3000); // 设定监听端口
// Environment sets...

// module.exports = app; 这是 4.x 默认的配置，分离了 app 模块,将它注释即可，上线时可以重新改回来

//启动监听
app.listen(app.get('port'));