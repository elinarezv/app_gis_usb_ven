var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const Pool = require('pg').Pool;
const pg = require('pg');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

var VerifyToken = require('../auth/VerifyToken');

router.get('/getLocations', VerifyToken, (req, res, next) => {
  //router.get('/getlocations', (req, res) => {
  const pool = new Pool({
    user: 'elinarezv',
    host: 'localhost',
    database: 'amenazasdb',
    password: 'Anaporatumacaya',
    port: 5432
  });
  console.log('Entering loadLocations');
  var queryString = 'SELECT (row_to_json(ciudad.*)) \
                     FROM (SELECT ciudades.id, ciudades.nombre, ciudades.esquema, \
                      ciudades.latitud, ciudades.longitud FROM public.ciudades \
                      WHERE ciudades.publicada = true \
                      ORDER BY orden ASC) AS ciudad';
  pool.connect((err, client, done) => {
    var query = client.query(new pg.Query(queryString));
    query.on('row', (row, result) => {
      result.addRow(row.row_to_json);
    });
    query.on('end', result => {
      res.send(result.rows);
      console.log(result.rows);
      pool.end();
    });
    query.on('error', err => {
      console.log(err);
    });
    done();
  });
});

router.get('/getLocationsLayers', VerifyToken, (req, res, next) => {
  var cityID = req.query.cityID;
  if (!cityID || cityID === '') {
    return res.status(500).send({ message: 'Parámetros incorrectos.' });
  }
  const pool = new Pool({
    user: 'elinarezv',
    host: 'localhost',
    database: 'amenazasdb',
    password: 'Anaporatumacaya',
    port: 5432
  });
  var queryString = 'SELECT row_to_json(cp.*) \
                      FROM ( \
                        SELECT  capa.id AS id_capa, capa.nom_tabla, capa.nombre, \
                          capa.descripcion, capa.rel_asociacion, capa.color, \
                          capa.datum, am_array(capa.id) AS amenazas, capa.fijar_capa,  \
                          capa.dotted, capa.stripe, \
                          get_geojson(ciudad.esquema,capa.nom_tabla) AS geojson \
                        FROM public.ciudades AS ciudad \
                        INNER JOIN public.capas AS capa \
                        ON capa.id_ciudad = ciudad.id \
                        WHERE ciudad.id = ' + cityID + ' \
                      ) as cp';

  pool.connect((err, client, done) => {
    var query = client.query(new pg.Query(queryString));
    query.on('row', (row, result) => {
      result.addRow(row.row_to_json);
    });
    query.on('end', result => {
      res.send(result.rows);
      pool.end();
    });
    query.on('error', err => {
      console.log(err);
    });
    done();
  });
});

router.get('/getTreats', VerifyToken, (req, res, next) => {
  var cityID = req.query.cityID;
  if (!cityID || cityID === '') {
    return res.status(500).send({ message: 'Parámetros incorrectos.' });
  }
  const pool = new Pool({
    user: 'elinarezv',
    host: 'localhost',
    database: 'amenazasdb',
    password: 'Anaporatumacaya',
    port: 5432
  });
  var queryString = 'SELECT row_to_json(amenazas.*) FROM \
	                      (SELECT amen.nombre FROM ( \
		                        SELECT 	ciudades.id AS id_ciudad, capas.id AS id_capa \
		                        FROM public.ciudades \
		                        INNER JOIN public.capas ON ciudades.id = capas.id_ciudad \
		                        WHERE id_ciudad = ' + cityID + ' \
	                      ) AS capasxciudad \
	                      JOIN public.capas_amenazas AS cxa ON capasxciudad.id_capa = cxa.id_capa \
	                      JOIN public.amenazas AS amen ON cxa.id_amenaza = amen.id \
	                      GROUP BY amen.nombre) AS amenazas';
  pool.connect(function (err, client, done) {
    var query = client.query(new pg.Query(queryString));
    query.on('row', function (row, result) {
      result.addRow(row.row_to_json);
    });
    query.on('end', function (result) {
      // pool shutdown
      res.send(result.rows);
      pool.end();
    });
    query.on('error', err => {
      console.log(err);
    });
    done();
  });
});

router.get('/getlayer', VerifyToken, function (req, res, next) {
  const pool = new Pool({
    user: 'elinarezv',
    host: 'localhost',
    database: 'amenazasdb',
    password: 'Anaporatumacaya',
    port: 5432
  });
  var cityName = req.query.cityName;
  var layerName = req.query.layerName;

  if (!layerName || layerName === '' || !cityName || cityName === '') {
    return res.status(500).send({ message: 'Parámetros incorrectos.' });
  }
  var queryString = 'SELECT * FROM ' + cityName + '.' + layerName + ' ';
  pool.connect(function (err, client, done) {
    var query = client.query(new pg.Query(queryString));
    query.on('row', function (row, result) {
      result.addRow(row);
    });
    query.on('end', function (result) {
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
