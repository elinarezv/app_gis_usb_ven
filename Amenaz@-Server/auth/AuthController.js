var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'elinarezv',
  host: 'localhost',
  database: 'amenazas',
  password: 'Anaporatumacaya',
  port: 5432
});

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

var VerifyToken = require('./VerifyToken');

router.post('/register', function(req, res) {
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  const { fName, lName, addr, email, password, notifications } = req.body;
  (strQuery = 'INSERT INTO users (firstname, lastname, address, email, password, notifications) VALUES ($1, $2, $3, $4, $5, $6)'),
    [fName, lName, addr, email, hashedPassword, notifications];
  pool.query(
    'INSERT INTO public.users (firstname, lastname, address, email, password, notifications) VALUES ($1, $2, $3, $4, $5, $6)',
    [fName, lName, addr, email, hashedPassword, notifications],
    (err, user) => {
      if (err) return res.status(500).send('There was a problem registering the user.');
      pool.query('SELECT * FROM public.users WHERE email = $1', [email], (err, user) => {
        if (err) return res.status(500).send('There was a problem finding the user.');
        if (!user) return res.status(404).send('No user found.');
        // create a token
        var token = jwt.sign({ id: user.rows[0].id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token });
      });
    }
  );
});

router.get('/user', VerifyToken, function(req, res, next) {
  const id = parseInt(req.userId);
  pool.query('SELECT * FROM public.users WHERE id = $1', [id], (err, user) => {
    if (err) return res.status(500).send('There was a problem finding the user.');
    if (!user) return res.status(404).send('No user found.');
    user.rows[0].password = 0;
    res.status(200).send(user.rows);
  });
});

router.post('/login', function(req, res) {
  const email = req.body.email;
  pool.query('SELECT * FROM public.users WHERE email = $1', [email], (err, user) => {
    if (err) return res.status(500).send('There was a problem finding the user.');
    if (!user) return res.status(404).send('No user found.');

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.rows[0].password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    var token = jwt.sign({ id: user.rows[0].id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    res.status(200).send({ auth: true, token: token });
  });
});

module.exports = router;
