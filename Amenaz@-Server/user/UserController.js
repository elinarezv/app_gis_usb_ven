var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'elinarezv',
  host: 'localhost',
  database: 'amenazas',
  password: 'Anaporatumacaya',
  port: 5432
});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', function(req, res) {
  pool.query('SELECT * FROM users ORDER BY id ASC', (err, users) => {
    if (err) return res.status(500).send('There was a problem finding the users.');
    res.status(200).send(users);
  });
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', function(req, res) {
  const id = parseInt(req.params.id);
  pool.query('SELECT * FROM users WHERE id = $1', [id], (err, user) => {
    if (err) return res.status(500).send('There was a problem finding the user.');
    if (!user) return res.status(404).send('No user found.');
    res.status(200).send(user);
  });
});

// CREATES A NEW USER
router.post('/', function(req, res) {
  const { firstname, lastname, address, email, notifications } = req.body;
  pool.query(
    'INSERT INTO users (firstname, lastname, address, email, notifications) VALUES ($1, $2, $3, $4, $5)',
    [firstname, lastname, address, email, notifications],
    (err, user) => {
      if (err) return res.status(500).send('There was a problem adding the information to the database.');
      res.status(200).send(user);
    }
  );
});

// DELETES A USER FROM THE DATABASE
router.delete('/:id', function(req, res) {
  const id = parseInt(req.params.id);
  pool.query('DELETE FROM users WHERE id = $1', [id], (err, user) => {
    if (err) return res.status(500).send('There was a problem deleting the user.');
    res.status(200).send('User: ' + user.name + ' was deleted.');
  });
});

// UPDATES A SINGLE USER IN THE DATABASE
router.put('/:id', function(req, res) {
  const id = parseInt(req.params.id);
  const { firstname, lastname, address, email, notifications } = req.body;
  pool.query(
    'UPDATE users SET firstname = $1, lastname = $2, address = $3, email = $4, notifications = $5 WHERE id = $6',
    [firstname, lastname, address, email, notifications, id],
    (err, user) => {
      if (err) return res.status(500).send('There was a problem updating the user.');
      res.status(200).send(user);
    }
  );
});

module.exports = router;
