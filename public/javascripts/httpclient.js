const http = require('http');
var querystring = require('querystring');
var session = require('express-session');
var mongoose = require('mongoose');
var rno = "";

process.on('uncaughtException', function(err) {
  console.log(err);
});

var httpclient = {
  entrance: function(req, resp, func) {
    var options = {
      method: 'GET',
      /*host: 'uems.sysu.edu.cn',
      path: '/jwxt/',*/
      host: '127.0.0.1',
      port: 8888,
      path: 'http://uems.sysu.edu.cn/jwxt/',
      headers: {
        'Cache-Control': 'max-age=0',
        'Host': "uems.sysu.edu.cn",
        'Content-Type': 'application/x-www-form-urlencoded',
        'Upgrade-Insecure-Requests': '1'
      },
      secureProtocol: 'SSLv3_method'
    }
    var request = http.request(options, function(res) {
      var data = "";
      res.on('data', function(chunk) {
        data += chunk;
      })
      res.on("end", function() {
        var reg = new RegExp('id="rno"[^\s*]name="rno"[^\s*]value=([^>]*)')
        rno = data.match(reg)[1];
        reg = new RegExp("(JSESSIONID=[^;]*)");
        GLOBAL.jsessionid = res.headers['set-cookie'].toString().match(reg)[1];
        req.session.jsessionid = GLOBAL.jsessionid;
        func(resp); //回调同步，使得获取验证码图片的时候取得的COOKIE
      })
    });
    request.on('error', function(e) {
      console.log(e);
    });
    request.end();
  },
  getCaptcha: function(resp) {
    var options = {
      method: 'GET',
      host: '127.0.0.1',
      port: 8888,
      path: 'http://uems.sysu.edu.cn/jwxt/jcaptcha/',
      /*host: 'uems.sysu.edu.cn',
      path: '/jwxt/jcaptcha/',*/
      headers: {
        'Cache-Control': 'max-age=0',
        'Host': "uems.sysu.edu.cn",
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': GLOBAL.jsessionid,
        'Referer': 'http://uems.sysu.edu.cn/jwxt/'
      },
      secureProtocol: 'SSLv3_method'
    }
    var request = http.request(options, function(res) {
      var imagedata = '';
      res.setEncoding('binary')
      res.on('data', function(chunk) {
        imagedata += chunk
      })
      res.on('end', function() {
        resp.writeHead(200, {
          'Content-Type': 'image/jpeg'
        });
        resp.end(imagedata, 'binary');
      })
    })
    request.on('error', function(e) {
      console.log(e);
    });
    request.end();
  },
  login: function(req, resp) {

    var post_data = querystring.stringify({
      'j_username': req.body.username,
      'j_password': req.body.password,
      'rno': rno,
      'jcaptcha_response': req.body.captcha
    });

    var options = {
      host: '127.0.0.1',
      port: 8888,
      path: "http://uems.sysu.edu.cn/jwxt/j_unieap_security_check.do",
      method: 'POST',
      headers: {
        'Cache-Control': 'max-age=0',
        'Host': "uems.sysu.edu.cn",
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': post_data.length,
        'Cookie': GLOBAL.jsessionid,
        'Referer': 'http://uems.sysu.edu.cn/jwxt/',
        'Origin': 'http://uems.sysu.edu.cn',
        'Upgrade-Insecure-Requests': '1',
        'Connection': 'keep-alive'
      },
      secureProtocol: 'SSLv3_method'
    }
    var request = http.request(options, function(res) {
      if (res.statusCode == 200 || res.statusCode == 302) {
        var data = "";
        res.on('data', function(chunk) {
          data += chunk;
        }).on('end', function() {
          var loc = res.headers['location'];
          if (loc == undefined) {
            resp.status(400);
            resp.send("学号或密码或验证码不正确");

          } else {
            //登录成功，将jsessionid保存到数据库，方便每次后台代码改动，可以得到这个jsessionid
            var Collection = req.cookieColect;
            Collection.findOne({
              "key": "jsessionid"
            }, function(err, submit) {
              if (err) throw err;
              submit.update({
                value: GLOBAL.jsessionid
              }, function(err) {
                if (err) {
                  console.log("mongodb jessionid update error!")
                  throw err;
                }
              })
            });
            resp.end('index');
          }
        })
      } else {
        resp.writeHead(404, {
          'Content-Type': 'text/html'
        });
        resp.end("404 error!!");
      }
    })
    request.on('error', function(e) {
      console.log(e);
    });
    request.write(post_data);
    request.end();
  }
}

module.exports = httpclient;