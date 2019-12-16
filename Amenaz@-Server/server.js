var app = require('./app');
var config = require('./config.js');
var port = config.port;

var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});
