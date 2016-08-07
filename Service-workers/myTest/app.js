'use strict';
var express = require('express');
var app = express();
var https = require('https');
var fs = require('fs');
var path = require('path');

var sslcert = {
  key:  fs.readFileSync(path.join(__dirname, 'cert', 'app.key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'app.cert.pem'))
};    

var httpsServer = require('https').createServer(sslcert, app);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('x-powered-by', false);
app.use(express.static(path.join(__dirname, 'static')));

httpsServer.listen(3000, () => {
  console.log('Express server started');

  app.get("/", (req, res) => {
    res.render("main", {
      "title":  "Service workers"
    });
  });

  app.use((req, res, next) => {
    if (req.accepts('html')) {
      return res.status(404).send("<h2>Извините, но я не могу найти эту страницу.</h2>");
    };
    if (req.accepts('json')) {
      return res.json({ error: 'Not found' });
    };
    res.type('txt');
    res.status(404).send("Не могу найти страницу.");
  });
    
  app.use((err, req, res, next) => {
    res.status(500).send("<strong>Обнаружена ошибка в работе сервера. Обратитесь к Администратору.</strong>");
  })
});
