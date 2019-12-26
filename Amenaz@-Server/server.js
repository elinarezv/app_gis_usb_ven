var http = require('http');
var https = require('https');
var fs = require('fs');

var app = require('./app');
var config = require('./config.js');

var port = config.port;
var sslOptions = {
  key: fs.readFileSync('certs/privkey.pem'),
  cert: fs.readFileSync('certs/cert.pem')
};

var server = https.createServer(sslOptions, app).listen(port, function() {
  console.log('Express server listening on port ' + port);
});
