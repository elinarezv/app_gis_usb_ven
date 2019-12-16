var express = require('express');
const cors = require('cors');
var app = express();

var AuthController = require('./auth/AuthController');
app.use(cors());
app.use('/auth', AuthController);

module.exports = app;
