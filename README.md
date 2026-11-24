**Aluno:** Jorge Lucas Cruz Barbosa De Oliveira  
**Aplicação publicada (Render):** https://chamados-ti-jorge-oliveira.onrender.com

# HelpDesk TI — Organização de Chamados

Sistema web local para abertura, acompanhamento e organização de chamados de TI, construído no padrão **MVC** com **Node.js, Express, EJS, CSS e Sequelize** (SQLite).

> Agora o sistema tem login com Firebase (e-mail/senha e Google).

## Como rodar

```bash
npm install
npm start        # http://localhost:3000
```

Antes é preciso preencher o `firebase.config.json` (ver abaixo).

- `npm run dev` — reinicia automaticamente ao salvar arquivos (`node --watch`).
- `npm run seed` — **recria** o banco com os dados de exemplo.

Na primeira execução o arquivo `database.sqlite` é criado e populado automaticamente.

## Funcionalidades

- **Dashboard**: indicadores, fila prioritária, chamados por prioridade/status, carga da equipe, distribuição por categoria e tempo médio de resolução.
- **Chamados**: CRUD completo, busca (título, solicitante, protocolo `CH-00001`), filtros por status, prioridade, categoria e técnico.
- **Ações rápidas**: alterar status, prioridade e responsável com registro automático no histórico.
- **Comentários** e linha do tempo por chamado.
- **Técnicos** e **Categorias**: cadastro, edição e remoção.

## Estrutura (MVC)

```
app.js                 # inicialização do Express e do banco
config/                # conexão Sequelize e constantes (status, prioridades, setores)
models/                # Category, Technician, Ticket, Comment + associações
controllers/           # regras de cada recurso
routes/                # mapeamento de URLs -> controllers
middlewares/           # variáveis globais para as views
views/                 # templates EJS (partials, tickets, technicians, categories)
public/                # CSS e JS estáticos
seeders/               # dados de exemplo
utils/                 # helpers (datas, ícones, erros de validação)
```

## Autenticação com Firebase

- Login e cadastro com e-mail e senha, e login com Google (`/login`).
- Mensagens de erro em português (senha errada, e-mail já cadastrado, pop-up fechado...).
- Todas as páginas exigem login. O token do Firebase é conferido no servidor (`middlewares/auth.js`) e no navegador com `onAuthStateChanged` (`public/js/auth.js`).
- O nome e o e-mail do usuário aparecem no menu lateral, junto com o botão Sair.
- Cada chamado salva o `uid`, o `autorEmail` e o `autorNome` de quem abriu, e a listagem mostra a coluna "Aberto por".
- Como os dados ficam no SQLite e não no Firestore, a regra de `request.auth != null` foi feita no servidor: sem login nenhuma rota responde.

### Configuração

1. Criar um projeto no Console do Firebase.
2. Em Authentication > Sign-in method, ativar E-mail/senha e Google.
3. Registrar um app Web e copiar o `firebaseConfig` para o arquivo `firebase.config.json`.
4. Em Authentication > Settings > Authorized domains, adicionar o domínio do Render.

### Deploy no Render

Como o projeto usa Node.js com Express, ele foi publicado como Web Service:

- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Plano: Free

Obs.: no plano gratuito o banco é recriado quando o serviço reinicia, então os chamados novos não ficam salvos para sempre.
