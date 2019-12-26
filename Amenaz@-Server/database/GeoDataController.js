var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const Pool = require('pg').Pool;

const pg = require('pg');
var conString = 'postgres://elinarezv:Anaporatumacaya@localhost/amenazasdb';

const APK_city = 'merida';

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

var VerifyToken = require('../auth/VerifyToken');

router.get('/getlayer', VerifyToken, function(req, res, next) {
  //router.get('/getlayer', function(req, res) {
  var layerName = req.query.layerName;
  if (!layerName || layerName === '') {
    return res.status(500).send('No layerName send.');
  }
  var queryString = 'SELECT * FROM merida.' + layerName + ' ';
  console.log('layerName: ' + layerName);
  console.log('Query: ' + queryString);
  const pool = new Pool({
    user: 'elinarezv',
    host: 'localhost',
    database: 'amenazasdb',
    password: 'Anaporatumacaya',
    port: 5432
  });
  pool.connect(function(err, client, done) {
    var query = client.query(new pg.Query(queryString));
    query.on('row', function(row, result) {
      result.addRow(row);
    });
    query.on('end', function(result) {
      // pool shutdown
      res.send(result.rows[0].row_to_json);
      pool.end();
    });
    query.on('error', err => {
      console.log(err);
    });
    done();
  });
});

module.exports = router;
