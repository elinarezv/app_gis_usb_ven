var express = require('express');
var cors = require('cors');

const whitleListDomain = ['http://localhost:3000', 'http://35.238.25.194', 'http://localhost:8100'];

var app = express();

app.use(
  cors({
    origin: function(origin, callback) {
    // allow requests with no origin
    // (like mobile apps or curl requests)
    //   if (!origin) return callback(null, true);
    //   if (whitleListDomain.indexOf(origin) === -1) {
    //     var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    //     return callback(new Error(msg), false);
    //   }
      return callback(null, true);
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-type', 'Authorization', 'X-access-token'],
    maxAge: 86400
  })
);

var AuthController = require('./auth/AuthController');
var GeoDataController = require('./database/GeoDataController.js');

app.use('/auth', AuthController);
app.use('/data', GeoDataController);

module.exports = app;
