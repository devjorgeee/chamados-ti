// Configuração do Firebase (valores no firebase.config.json)
const firebaseConfig = require('../firebase.config.json');

const configurado = Boolean(firebaseConfig.apiKey) && !firebaseConfig.apiKey.includes('COLE_AQUI');

module.exports = { firebaseConfig, configurado };
