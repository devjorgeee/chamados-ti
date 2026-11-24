// Inicia o Firebase no navegador
import { firebaseConfig } from '/firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'pt-BR';

export {
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
};

// manda o token para o servidor criar a sessão
export async function criarSessao(user, forcarRenovacao = false) {
  const token = await user.getIdToken(forcarRenovacao);
  const resp = await fetch('/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!resp.ok) throw Object.assign(new Error('Sessão recusada pelo servidor.'), { code: 'app/sessao' });
}

export async function encerrarSessao() {
  await fetch('/auth/logout', { method: 'POST' }).catch(() => {});
}
