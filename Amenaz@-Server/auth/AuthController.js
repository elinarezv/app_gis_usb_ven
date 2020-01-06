var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'elinarezv',
  host: 'localhost',
  database: 'amenazasdb',
  password: 'Anaporatumacaya',
  port: 5432
});

const APK_city = 'merida';
const USER_TABLE = APK_city + '.users';

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

var VerifyToken = require('./VerifyToken');

router.post('/register', function(req, res) {
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  const { fName, lName, addr, email, password, notifications } = req.body;
  console.log('INSERTING USER...');
  console.log('With: ' + fName + ',' + lName + ',' + addr + ',' + email + ',' + hashedPassword + ',' + notifications);
  pool.query(
    'INSERT INTO merida.users (firstname, lastname, address, email, password, notifications) VALUES ($1, $2, $3, $4, $5, $6)',
    [fName, lName, addr, email, hashedPassword, notifications],
    (err, user) => {
      if (err) {
        console.log(err);
        return res.status(500).send('There was a problem registering the user.');
      }

      pool.query('SELECT * FROM merida.users WHERE email = $1', [email], (err, user) => {
        if (err) return res.status(500).send('There was a problem finding the user.');
        if (user.rowCount == 0) {
          return res.status(404).send('No user found.');
        }
        var token = jwt.sign({ id: user.rows[0].id }, config.secret, {
          algorithm: 'HS256',
          expiresIn: 31536000 // expires in 1 year
        });

        res.status(200).send({ auth: true, token: token });
      });
    }
  );
});

router.get('/user', VerifyToken, function(req, res, next) {
  const id = parseInt(req.userId);
  pool.query('SELECT * FROM merida.users WHERE id = $1', [id], (err, user) => {
    if (err) return res.status(500).send('There was a problem finding the user.');
    if (user.rowCount == 0) {
      return res.status(404).send('No user found.');
    }
    user.rows[0].password = 0;
    res.status(200).send(user.rows);
  });
});

router.get('/logout', VerifyToken, function(req, res, next) {
  const id = parseInt(req.userId);
  userLogout = {
    id: id,
    message: 'Cierre de sesión satisfactorio'
  };
  res.status(200).send(JSON.stringify(userLogout));
});

router.post('/login', function(req, res) {
  const email = req.body.email;
  if (!email) {
    return res.status(500).send('No user send.');
  }
  pool.query('SELECT * FROM merida.users WHERE email = $1', [email], (err, user) => {
    if (err) {
      console.log(err);
      return res.status(500).send('There was a problem finding the user.');
    }
    if (user.rowCount == 0) {
      return res.status(404).send('No user found.');
    }
    if (req.body.password) {
      password2Compare = req.body.password;
    } else {
      password2Compare = '';
    }
    var passwordIsValid = bcrypt.compareSync(password2Compare, user.rows[0].password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    var token = jwt.sign({ id: user.rows[0].id }, config.secret, {
      algorithm: 'HS256',
      expiresIn: 31536000 // expires in 1 year
    });

    res.status(200).send({ auth: true, token: token });
  });
});

module.exports = router;
