var express = require('express');
var router = express.Router();
var queryInfos = require("../public/javascripts/queryInfos");

process.on('uncaughtException', function(err) {
  console.log(err);
});

router.get('/', function(req, res, next) {
	queryInfos.init(req, res, 'index');
});

router.get('/getInfo', function(req, res, next) {
	queryInfos.getInfo(req, res);
})

router.get('/logout', function(req, res, next) {
	queryInfos.logout(req, res);
})

module.exports = router;