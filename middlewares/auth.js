// Autenticação: confere o token do Firebase que fica no cookie
const { createRemoteJWKSet, jwtVerify, decodeJwt } = require('jose');
const { firebaseConfig } = require('../config/firebase');

const COOKIE = 'token';
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

async function verifyIdToken(token) {
  const projectId = firebaseConfig.projectId;
  const issuer = `https://securetoken.google.com/${projectId}`;
  const { payload } = await jwtVerify(token, JWKS, { issuer, audience: projectId, algorithms: ['RS256'] });

  if (!payload.sub) throw new Error('Token sem usuário.');
  const email = payload.email || '';
  return {
    uid: payload.sub,
    email,
    nome: payload.name || email.split('@')[0] || 'Usuário',
    foto: payload.picture || null,
    provedor: payload.firebase && payload.firebase.sign_in_provider,
  };
}

function lerCookie(req, nome) {
  const header = req.headers.cookie || '';
  for (const parte of header.split(';')) {
    const [k, ...v] = parte.trim().split('=');
    if (k === nome) return decodeURIComponent(v.join('='));
  }
  return null;
}

function cookieOptions(req) {
  return { httpOnly: true, sameSite: 'lax', secure: req.secure, path: '/' };
}

// coloca o usuário logado em req.user
async function loadUser(req, res, next) {
  req.user = null;
  const token = lerCookie(req, COOKIE);
  if (token) {
    try {
      req.user = await verifyIdToken(token);
    } catch {
      res.clearCookie(COOKIE, cookieOptions(req));
    }
  }
  res.locals.user = req.user;
  next();
}

// se não estiver logado manda para o login
function requireAuth(req, res, next) {
  if (req.user) return next();
  const destino = req.method === 'GET' ? req.originalUrl : '/';
  res.redirect(`/login?next=${encodeURIComponent(destino)}`);
}

// recebe o token depois do login e salva no cookie
async function createSession(req, res) {
  const token = req.body && req.body.token;
  if (!token) return res.status(400).json({ erro: 'Token ausente.' });
  try {
    const user = await verifyIdToken(token);
    const { exp } = decodeJwt(token);
    res.cookie(COOKIE, token, { ...cookieOptions(req), maxAge: Math.max(0, exp * 1000 - Date.now()) });
    res.json({ ok: true, user });
  } catch (err) {
    res.status(401).json({ erro: 'Token inválido.', detalhe: err.message });
  }
}

// logout: apaga o cookie
function destroySession(req, res) {
  res.clearCookie(COOKIE, cookieOptions(req));
  res.json({ ok: true });
}

module.exports = { loadUser, requireAuth, createSession, destroySession, verifyIdToken };
