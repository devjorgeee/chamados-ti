const express = require('express');
const { firebaseConfig, configurado } = require('../config/firebase');
const { createSession, destroySession } = require('../middlewares/auth');

const router = express.Router();

// tela de login
router.get('/login', (req, res) => {
  res.render('login', { title: 'Entrar', configurado });
});

// config do Firebase para o navegador
router.get('/firebase-config.js', (req, res) => {
  res.type('application/javascript').set('Cache-Control', 'no-cache');
  res.send(`export const firebaseConfig = ${JSON.stringify(firebaseConfig)};\n`);
});

router.post('/auth/session', express.json(), createSession);
router.post('/auth/logout', destroySession);

module.exports = router;
