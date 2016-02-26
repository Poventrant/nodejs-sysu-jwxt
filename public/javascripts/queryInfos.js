const http = require('http');
const querystring = require('querystring');
var async = require('async');
var session = require('express-session');
const paths = require('./jwxt_paths');
var json5 = require('json5')
var putil = require('./jwxt_paths_util');

var username = "",
	grade = "",
	proNo = "";
var mainInfo = {},
	downInfo = {};
var XN, XQ, PYLB, KCLB;
var PARAMS = [];

function dumpError(err) {
	if (typeof err === 'object') {
		if (err.message) {
			console.log('\nMessage: ' + err.message)
		}
		if (err.stack) {
			console.log('\nStacktrace:')
			console.log('====================')
			console.log(err.stack);
		}
	} else {
		console.log('dumpError :: argument is not an object');
	}
}

var query = {

	getJudge: function(req) {
		var post_data = putil.getJudge();
		var header = putil.setReqHeader(req.session.jsessionid, paths.SCORE);
		var options = {
			method: "post",
			host: '127.0.0.1',
			port: 8888,
			path: paths.JUDGE,
			headers: header
		}
		var request = http.request(options, function(res) {
			try {
				var data = "";
				res.on('data', function(chunk) {
					data += chunk;
				}).on('end', function() {
					var result = /result:\"([^\"]*)/.exec(data)[1].split(",");
					username = result[0];
					grade = result[1];
					proNo = result[2]
				})
			} catch (err) {
				throw err;
			}
		});
		request.write(post_data);
		request.on('error', function(e) {
			console.log(e);
		});
		request.end();
	},

	init: function(req, resp, opt) {
		var judge = this.getJudge;
		//获取学年
		var getXn = function(req, resp, opt, result) {
			var options = {
				method: 'GET',
				host: '127.0.0.1',
				port: 8888,
				path: paths.ALLXN,
				headers: {
					'Cache-Control': 'max-age=0',
					'Cookie': req.session.jsessionid,
					'Host': "uems.sysu.edu.cn",
					'Content-Type': 'application/x-www-form-urlencoded',
					'Upgrade-Insecure-Requests': '1'
				}
			}
			var request = http.request(options, function(res) {
				try {
					var data = "";
					res.on('data', function(chunk) {
						data += chunk;
					}).on('end', function() {
						var groups = null,
							matches = [],
							reg = /CODENAME:\"([0-9]{4}-[0-9]{4})\"/gi;
						while (groups = reg.exec(data)) {
							matches.push(groups[1]);
						}
						result['xnList'] = matches;
						resp.render(opt, result);
						judge(req);
					})
				} catch (err) {
					dumpError(err);
					resp.render("error", {
						error: err
					});
				}
			});
			request.on('error', function(e) {
				console.log(e);
			});
			request.end();
		}

		var getName = function(req, resp, opt) {
			var option = {
				method: "get",
				host: '127.0.0.1',
				port: 8888,
				path: paths.NAME,
				headers: putil.setReqHeader(req.session.jsessionid, paths.RNAME)
			}
			var request = http.request(option, function(res) {
				try {
					var data = "";
					res.on("data", function(chunk) {
						data += chunk;
					}).on("end", function() {
						try {
							var name = /var\s*fullname\s*=\s*'([^']*)/.exec(data)[1];
							var result = {
								"student": name
							};
							getXn(req, resp, opt, result);
						} catch (err) {
							console.log("getName error! -- queryInfos.js")
							throw err;
						}
					});
				} catch (err) {
					dumpError(err);
					resp.render("error", {
						error: err
					});
				}
			})
			request.on('error', function(e) {
				console.log(e);
			});
			request.end();
		}
		if (req.session.jsessionid == undefined) {
			console.log("req.session.jsessionid: " + req.session.jsessionid)
			req.cookieColect.findOne({
				"key": "jsessionid"
			}, function(err, submit) {
				if (err) throw err;
				req.session.jsessionid = submit.value;
				GLOBAL.jsessionid = submit.value;
				getName(req, resp, opt);
			})
		} else getName(req, resp, opt);
	},
	getInfo: function(req, resp) {
		XN = req.query.xn, XQ = req.query.xq,
			PYLB = req.query.pylb, KCLB = req.query.kclb;
		downInfo.count = 0;
		var countAll = this.getCountAll;
		var callback = function() {
			downInfo.count++;
			if (downInfo.count >= 6) {
				countAll(req, resp);
			}
		}
		this.getKcList(req, resp, callback);
		this.getRight(req, resp, callback);
		this.getMid(req, resp, callback);
		this.getLeft(req, resp, callback);
	},
	getCountAll: function(req, resp, cb) {
		var reqEntity = putil.getCountAll(PARAMS, username, XN, XQ, PYLB);
		var option = {
			method: "post",
			host: '127.0.0.1',
			port: 8888,
			path: paths.COUNTALL,
			headers: putil.setReqHeader(req.session.jsessionid, paths.RKCLIST)
		}
		var request = http.request(option, function(res) {
			try {
				var data = "";
				res.on("data", function(chunk) {
					data += chunk;
				}).on("end", function() {
					try {
						var result = json5.parse(data).body.parameters;
						resp.json({
							mainInfo: mainInfo,
							downInfo: downInfo,
							countAll: result
						});
					} catch (err) {
						console.log("parse json error! -- queryInfos.js")
						throw err;
					}
				});
			} catch (err) {
				dumpError(err);
				resp.render("error", {
					error: err
				});
			}
		})
		request.write(reqEntity);
		request.on('error', function(e) {
			console.log(e);
		});
		request.end();
	},
	getKcList: function(req, resp, cb) {
		var reqEntity = putil.getKcList(XN, XQ, PYLB, KCLB);
		var option = {
			method: "post",
			host: '127.0.0.1',
			port: 8888,
			path: paths.KCCJLIST,
			headers: putil.setReqHeader(req.session.jsessionid, paths.RKCLIST)
		}
		var request = http.request(option, function(res) {
			try {
				var data = "";
				res.on("data", function(chunk) {
					data += chunk;
				}).on("end", function() {
					try {
						var result = json5.parse(data).body.dataStores.kccjStore.rowSet.primary;
						putil.changeKclb(result)
						mainInfo = result;
						cb();
					} catch (err) {
						console.log("parse json error! -- queryInfos.js")
						throw err;
					}
				});
			} catch (err) {
				dumpError(err);
				resp.render("error", {
					error: err
				});
			}
		})
		request.write(reqEntity);
		request.on('error', function(e) {
			console.log(e);
		});
		request.end();
	},
	getRight: function(req, resp, cb) {
		var reqEntity = putil.getRight(PYLB, grade, proNo);
		var headers = putil.setReqHeader(req.session.jsessionid, paths.RKCLIST);
		headers['Content-Type'] = "application/json";
		var option = {
			method: "post",
			host: '127.0.0.1',
			port: 8888,
			path: paths.ZYXF,
			headers: headers
		}
		var request = http.request(option, function(res) {
			try {
				var data = "";
				res.on("data", function(chunk) {
					data += chunk;
				}).on("end", function() {
					try {
						var result = json5.parse(data).body.dataStores.zxzyxfStore.rowSet.primary;
						downInfo.right = result;
						var temp = [];
						for (var i = 0; i < result.length; ++i) {
							temp[i] = result[i].twoColumn;
						}
						PARAMS[0] = temp;
						cb();
					} catch (err) {
						console.log("parse json error! -- queryInfos.js")
						throw err;
					}
				});
			} catch (err) {
				dumpError(err);
				resp.render("error", {
					error: err
				});
			}
		})
		request.write(reqEntity);
		request.on('error', function(e) {
			console.log(e);
		});
		request.end();
	},
	getMid: function(req, resp, cb) {
		var reqEntityXF = putil.getMidXf(username, PYLB);
		var reqEntityJD = putil.getMidJd(username);
		downInfo.mid = {};

		var headers = putil.setReqHeader(req.session.jsessionid, paths.RKCLIST);
		headers['Content-Type'] = "application/json";

		var option = {
				method: "post",
				host: '127.0.0.1',
				port: 8888,
				path: paths.ALLXF,
				headers: headers
			}
			//获取学分
		var request = http.request(option, function(res) {
			try {
				var data = "";
				res.on("data", function(chunk) {
					data += chunk;
				}).on("end", function() {
					try {
						var result = json5.parse(data).body.dataStores.allXfStore.rowSet.primary;
						downInfo.mid.xf = result;
						var temp = [];
						for (var i = 0; i < result.length; ++i) {
							temp[i] = result[i].twoColumn;
						}
						PARAMS[1] = temp;
						cb();
					} catch (err) {
						console.log("parse json error! -- queryInfos.js")
						throw err;
					}
				});
			} catch (err) {
				dumpError(err);
				resp.render("error", {
					error: err
				});
			}
		})
		request.write(reqEntityXF);
		request.on('error', function(e) {
			console.log(e);
		});
		request.end();
		//获取绩点
		option.path = paths.ALLJD;
		request = http.request(option, function(res) {
			try {
				var data = "";
				res.on("data", function(chunk) {
					data += chunk;
				}).on("end", function() {
					try {
						var result = json5.parse(data).body.dataStores.allJdStore.rowSet.primary;
						downInfo.mid.jd = result;
						cb();
					} catch (err) {
						console.log("parse json error! -- queryInfos.js")
						throw err;
					}
				});
			} catch (err) {
				dumpError(err);
				resp.render("error", {
					error: err
				});
			}
		})
		request.write(reqEntityJD);
		request.on('error', function(e) {
			console.log(e);
		});
		request.end();
	},
	getLeft: function(req, resp, cb) {
		var reqEntityXF = putil.getLeftXf(username, XN, XQ, PYLB);
		var reqEntityJD = putil.getLeftJd(username, XN, XQ);
		downInfo.left = {};

		var headers = putil.setReqHeader(req.session.jsessionid, paths.RKCLIST);
		headers['Content-Type'] = "application/json";
		var option = {
				method: "post",
				host: '127.0.0.1',
				port: 8888,
				path: paths.ALLXF,
				headers: headers
			}
			//获取学分
		var request = http.request(option, function(res) {
			try {
				var data = "";
				res.on("data", function(chunk) {
					data += chunk;
				}).on("end", function() {
					try {
						var result = json5.parse(data).body.dataStores.xfStore.rowSet.primary;
						downInfo.left.xf = result;
						var temp = [];
						for (var i = 0; i < result.length; ++i) {
							temp[i] = result[i].twoColumn;
						}
						PARAMS[2] = temp;
						cb();
					} catch (err) {
						console.log("parse json error! -- queryInfos.js")
						throw err;
					}
				});
			} catch (err) {
				dumpError(err);
				resp.render("error", {
					error: err
				});
			}
		})
		request.write(reqEntityXF);
		request.on('error', function(e) {
			console.log(e);
		});
		request.end();
		//获取绩点
		option.path = paths.ALLJD;
		request = http.request(option, function(res) {
			try {
				var data = "";
				res.on("data", function(chunk) {
					data += chunk;
				}).on("end", function() {
					try {
						var result = json5.parse(data).body.dataStores.jdStore.rowSet.primary;
						downInfo.left.jd = result;
						cb();
					} catch (err) {
						console.log("parse json error! -- queryInfos.js")
						throw err;
					}
				});
			} catch (err) {
				dumpError(err);
				resp.render("error", {
					error: err
				});
			}
		})
		request.write(reqEntityJD);
		request.on('error', function(e) {
			console.log(e);
		});
		request.end();
	},
	logout: function(req, resp) {
		var option = {
			method: "get",
			host: '127.0.0.1',
			port: 8888,
			path: paths.LOGOUT,
			headers: {
				"Content-Type": "multipart/form-data",
				"Referer": "http://uems.sysu.edu.cn/jwxt/edp/menu/RootMenu.jsp",
				'Host': "uems.sysu.edu.cn",
				'Cookie': req.session.jsessionid
			}
		}
		var request = http.request(option, function(res) {
			try {
				var data = "";
				res.on("data", function(chunk) {
					data += chunk;
				}).on("end", function() {
					try {
						resp.redirct("login");
					} catch (err) {
						console.log("parse json error! -- queryInfos.js")
						throw err;
					}
				});
			} catch (err) {
				dumpError(err);
				resp.render("error", {
					error: err
				});
			}
		})
		request.on('error', function(e) {
			console.log(e);
		});
		request.end();
	}
}

module.exports = query;