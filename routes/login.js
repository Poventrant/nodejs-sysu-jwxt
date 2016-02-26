var express = require('express');
var router = express.Router();
var httpclient = require('../public/javascripts/httpclient');

router.get('/', function(req, res, next) {
	res.render('login');
});

router.post('/login', function(req, res, next) {
	httpclient.login(req, res);
});

router.get('/getCaptcha', function(req, res, next) {
	httpclient.entrance(req, res, httpclient.getCaptcha);
});

router.get("/ngrouteTest", function(req, res) {
	res.render('login', {
		name: 'from express router api.js, front end!'
	});
})

module.exports = router;