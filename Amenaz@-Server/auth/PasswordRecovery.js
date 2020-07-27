var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');

function generatePassword() {
  var length = 8,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    retVal = '';
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'elinarezv',
  host: 'localhost',
  database: 'amenazasdb',
  password: 'Anaporatumacaya',
  port: 5432,
});

const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: 'vps.appmenazas.com',
  port: 25,
  auth: {
    user: 'no-responder@appmenazas.com',
    pass: 'czlY(92HYDb^',
  },
});

// Get email from url
router.get('/recover', function (req, res, next) {
  const userEmail = req.query.userEmail;
  pool.query('SELECT * FROM public.users WHERE email = $1', [userEmail], (err, user) => {
    if (err) return res.status(500).send('Ha habido un problema al buscar en la BD.');
    if (user.rowCount == 0) {
      return res.status(404).send('Usuario no encontrado.');
    }
    const userPassword = user.rows[0].password;
    const encodedUrl =
      'https://www.appmenazas.com:8088/account/passwordRecovery?userEmail=' +
      encodeURIComponent(userEmail) +
      '&passwdToken=' +
      encodeURIComponent(userPassword);
    const message = {
      from: 'no-responder@appmenazas.com', // Sender address
      to: userEmail, // List of recipients
      subject: 'Recuperación de contraseña', // Subject line
      text:
        'Hola, recibimos tu solicitud para recuperar la contraseña. ' +
        'Para recuperar tu contraseña haz click en el siguiente enlace o copia y pega el enlace en un navegador web: \n\r' +
        encodedUrl +
        '   \n\r' +
        'Por favor, ignora este mensaje en caso que no hayas solicitado recuperar la contraseña de tu cuenta. ',
    };
    transport.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
        return res.status(404).send('No se ha podido enviar el correo.\n');
      } else {
        console.log(info);
      }
    });
    res.status(200).send('Email enviado...\n');
  });
});

router.get('/passwordRecovery', function (req, res, next) {
  const passwdToken = req.query.passwdToken;
  const userEmail = req.query.userEmail;
  pool.query('SELECT * FROM public.users WHERE email = $1', [userEmail], (err, user) => {
    if (err) return res.status(500).send('Ha habido un problema al buscar en la BD.');
    if (user.rowCount == 0) {
      return res.status(404).send('Usuario no encontrado.');
    }
    if (user.rows[0].password == passwdToken) {
      const userPassword = generatePassword();
      const userId = user.rows[0].id;
      const hashedPassword = bcrypt.hashSync(userPassword, 8);
      pool.query('UPDATE public.users SET password = $1 WHERE id = $2', [hashedPassword, userId], (nerr, nuser) => {
        if (nerr) return res.status(500).send('Ha habido un problema al buscar en la BD.');
        if (nuser.rowCount == 0) {
          return res.status(404).send('Usuario no actualizado.');
        }
        const message = {
          from: 'no-responder@appmenazas.com', // Sender address
          to: userEmail, // List of recipients
          subject: 'Recuperación de contraseña', // Subject line
          text:
            'Hola, su contraseña ha sido cambiada. \n\r' +
            'Su nueva contraseña es: << ' +
            userPassword +
            ' >> sin las comillas.' +
            '\n\r',
        };
        transport.sendMail(message, function (err, info) {
          if (err) {
            console.log(err);
            return res.status(404).send('No se ha podido enviar el correo.\n');
          } else {
            console.log(info);
          }
        });
        htmlResponse =
          `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        h1 {text-align: center;}
                        p {text-align: center;}
                        div {text-align: center;}
                    </style>
                </head>
                <body>
                    <div><img src="https://www.appmenazas.com/assets/img/logo.png" width="100" /></div>
                    <h1>¡Contraseña cambiada exitosamente!</h1>
                    <p>
                        Se ha generado una nueva contraseña para su cuenta y se ha enviado al correo: ` +
          userEmail +
          `</p>
                    <p>
                    Revise su correo electrónico.
                    </p>
                </body>
            </html>
                `;
        res.status(200).send(htmlResponse);
      });
    }
  });
});

module.exports = router;
