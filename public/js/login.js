import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  criarSessao,
} from './firebase.js';

const form = document.getElementById('login-form');
const email = document.getElementById('email');
const senha = document.getElementById('senha');
const msg = document.getElementById('auth-msg');
const botoes = [...document.querySelectorAll('.auth-card button')];

// mensagens de erro em português
const ERROS = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/user-not-found': 'Não encontramos uma conta com este e-mail. Clique em "Criar conta".',
  'auth/invalid-email': 'Digite um e-mail válido.',
  'auth/missing-email': 'Digite seu e-mail.',
  'auth/missing-password': 'Digite sua senha.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado. Use o botão "Entrar".',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests': 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet e tente novamente.',
  'auth/popup-closed-by-user': 'A janela do Google foi fechada antes de concluir o login.',
  'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Permita pop-ups para este site.',
  'auth/account-exists-with-different-credential':
    'Já existe uma conta com este e-mail usando outro método de login.',
  'auth/unauthorized-domain':
    'Este domínio não está autorizado no Firebase.',
  'auth/operation-not-allowed': 'Este método de login não está ativado no Firebase.',
  'auth/invalid-api-key': 'Configuração do Firebase inválida. Confira o firebase.config.json.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'Configuração do Firebase inválida. Confira o firebase.config.json.',
  'auth/configuration-not-found': 'O Authentication ainda não foi ativado neste projeto do Firebase.',
  'app/sessao': 'Não foi possível iniciar a sessão no servidor. Tente novamente.',
};

function mostrar(texto, tipo = 'error') {
  msg.className = `alert auth-msg alert-${tipo}`;
  msg.textContent = texto;
  msg.hidden = false;
}

function ocupado(sim) {
  botoes.forEach((b) => (b.disabled = sim));
}

function destino() {
  const next = new URLSearchParams(location.search).get('next') || '/';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

let entrando = false;
async function concluir(user) {
  entrando = true;
  await criarSessao(user, true);
  location.replace(destino());
}

async function executar(acao) {
  msg.hidden = true;
  ocupado(true);
  try {
    const cred = await acao();
    await concluir(cred.user);
  } catch (err) {
    entrando = false;
    ocupado(false);
    if (err.code === 'auth/cancelled-popup-request') return;
    console.error(err);
    mostrar(ERROS[err.code] || 'Não foi possível entrar. Tente novamente.');
  }
}

function validarCampos() {
  if (!email.value.trim()) return mostrar(ERROS['auth/missing-email']), false;
  if (!senha.value) return mostrar(ERROS['auth/missing-password']), false;
  return true;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validarCampos()) return;
  executar(() => signInWithEmailAndPassword(auth, email.value.trim(), senha.value));
});

document.getElementById('btn-cadastrar').addEventListener('click', () => {
  if (!validarCampos()) return;
  executar(() => createUserWithEmailAndPassword(auth, email.value.trim(), senha.value));
});

document.getElementById('btn-google').addEventListener('click', () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  executar(() => signInWithPopup(auth, provider));
});

if (new URLSearchParams(location.search).has('saiu')) mostrar('Você saiu da sua conta.', 'success');

// se já estiver logado, entra direto
onAuthStateChanged(auth, (user) => {
  if (user && !entrando) {
    ocupado(true);
    concluir(user).catch(() => ocupado(false));
  }
});
