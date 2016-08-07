var express = require('express'),
    fs = require('fs'),
    https = require('https'),
    serveStatic = require('serve-static'),
    url = require('url'),
    webPush = require('web-push');

var options = {
  pfx: fs.readFileSync('aa34f6b8-f1c5-4e32-afd7-7a5f9f0b659c.pfx'),
  passphrase: 'password'
};

var app = express();
app.use(serveStatic(__dirname, {'index': false}));

app.post('/', function (request, response) {
  var body = "";

  request.on('data', function(chunk) {
    body += chunk;
  });

  request.on('end', function() {
    if (!body) return;
    var obj = JSON.parse(body);
    var bodyArray = [obj.statusType, obj.name, obj.endpoint];
    console.log('POSTed: ' + obj.statusType);

    if(obj.statusType === 'chatMsg') {
      var pushObj = {
        TTL: 60,
        payload:       JSON.stringify({action: obj.statusType, msg: obj.msg, name: obj.name}),
        userPublicKey: obj.key,
        userAuth:      obj.authSecret
      };
      webPush.sendNotification(obj.endpoint, pushObj);
    } else if(obj.statusType === 'init') {
      var pushObj = {
        TTL: 60,
        payload:       JSON.stringify({action: obj.statusType, name: obj.name}),
        userPublicKey: obj.key,
        userAuth:      obj.authSecret
      };
      webPush.sendNotification(obj.endpoint, pushObj);
    } else if(obj.statusType === 'subscribe') {
      var pushObj = {
        TTL: 60,
        payload:       JSON.stringify({action: obj.statusType, name: obj.name}),
        userPublicKey: obj.key,
        userAuth:      obj.authSecret
      };
      webPush.sendNotification(obj.endpoint, pushObj);
    } else if(obj.statusType === 'unsubscribe') {
      var pushObj = {
        TTL: 60,
        payload:       JSON.stringify({action: obj.statusType, name: obj.name}),
        userPublicKey: obj.key,
        userAuth:      obj.authSecret
      };
      webPush.sendNotification(obj.endpoint, pushObj);
    }
  });

  response.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, Access-Control-Allow-Headers"});

  response.write(JSON.stringify({"status": "ok"}));

  response.end();

});

var httpsServer = https.createServer(options, app)
httpsServer.listen(7000);
console.log("Server Running on 7000.");
