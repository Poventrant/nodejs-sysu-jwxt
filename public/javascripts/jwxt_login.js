var http = require('http');

var client = http.createClient(8888, '127.0.0.1');

var jsessionid = "",
  rno = "";
/*

var headers = {
  'Host': 'uems.sysu.edu.cn',
  'Cookie': cookie,
  'Content-Type': 'application/json',
  'Content-Length': Buffer.byteLength(data, 'utf8')
};
*/
// listening to the response is optional, I suppose
/*request.on('response', function(response) {
  response.on('data', function(chunk) {
    // do what you do
  });
  response.on('end', function() {
    // do what you do
  });
});*/
/*// you'd also want to listen for errors in production

request.write(data);

request.end();*/

var doit = {
  entrance: function(resp, func) {

    var request = client.request('GET', '/jwxt', {
      Host: "uems.sysu.edu.cn",
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    request.on('response', function(response) {
      var data = "";
      response.on('data', function(chunk) {
        data += chunk;
      });
      response.on('end', function() {
        var reg = new RegExp('id="rno"[^\s*]name="rno"[^\s*]value=([^>]*)')
        rno = data.match(reg)[1];
        reg = new RegExp("JSESSIONID=([^;]*)");
        jsessionid = res.headers['set-cookie'].toString().match(reg)[1];
        console.log("entrance: " + jsessionid);
        func(resp); //回调同步，使得获取验证码图片的时候取得的COOKIE
      });
    });

    request.end();
  },
  getCaptcha: function(resp) {
    console.log("getCaptcha: " + jsessionid);

    var request = client.request('GET', '/jwxt/jcaptcha', {
      Host: "uems.sysu.edu.cn",
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': jsessionid,
    })

    request.on('response', function(response) {
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

    request.end();
  }
}

module.exports = doit;