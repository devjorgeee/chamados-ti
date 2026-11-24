// Verifica se está logado, mostra o usuário e faz o logout
import { auth, onAuthStateChanged, onIdTokenChanged, signOut, criarSessao, encerrarSessao } from './firebase.js';

const nome = document.getElementById('user-name');
const email = document.getElementById('user-email');

let saindo = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (saindo) return;
    await encerrarSessao();
    location.replace(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
    return;
  }
  const exibicao = user.displayName || user.email.split('@')[0];
  if (nome) { nome.textContent = exibicao; nome.title = exibicao; }
  if (email) { email.textContent = user.email; email.title = user.email; }
});

// o token vence em 1 hora, então atualiza o cookie quando renovar
let primeiro = true;
onIdTokenChanged(auth, (user) => {
  if (primeiro) { primeiro = false; return; }
  if (user) criarSessao(user).catch(() => {});
});

document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
  e.currentTarget.disabled = true;
  saindo = true;
  await signOut(auth);
  await encerrarSessao();
  location.replace('/login?saiu=1');
});
