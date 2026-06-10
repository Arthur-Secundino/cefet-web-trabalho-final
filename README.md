# ShelfLog

Sua estante digital, do seu jeito. O ShelfLog é uma rede social de leitura: cada
usuário organiza seus livros em prateleiras, avalia o que leu e descobre o que
outras pessoas estão lendo. Os dados dos livros (capa, autor, sinopse) vêm da API
pública da [OpenLibrary](https://openlibrary.org/).

Trabalho final da disciplina de Web (CEFET).

## Funcionalidades

- **Cadastro e login** com senha criptografada (bcrypt) e sessão por cookie.
- **Autorização**: cada usuário só altera as próprias prateleiras.
- **Prateleiras**: criar coleções e adicionar livros (com busca na OpenLibrary).
- **Avaliações**: dar nota e comentário aos livros; ver as avaliações de outros.
- **Busca de livros** com sugestões ao vivo (autocomplete) e filtros.
- **Perfil público** compartilhável por URL (`/perfil/:id`), com estatísticas.

## Tecnologias

- **Back-end**: Node.js + Express 5 (SSR com Handlebars/hbs)
- **Banco de dados**: MongoDB (Atlas em produção; local em desenvolvimento)
- **Autenticação**: express-session + bcrypt
- **API externa**: OpenLibrary (dados dos livros)

## Como rodar localmente

Pré-requisitos: Node.js 18+ e um MongoDB (local ou Atlas).

```bash
git clone https://github.com/Arthur-Secundino/cefet-web-trabalho-final.git
cd cefet-web-trabalho-final
npm install
cp .env.example .env   # no Windows: copy .env.example .env
```

Edite o `.env` com a sua string de conexão (veja a seção abaixo). Depois:

```bash
npm run seed   # opcional: popula dados de exemplo
npm run dev    # inicia com nodemon (ou: npm start)
```

Acesse <http://localhost:3000>. Usuário de teste (após o seed): `arthur@exemplo.com` / `123456`.

## Variáveis de ambiente

Configuradas no arquivo `.env` (que não é versionado). Veja `.env.example`.

| Variável | Descrição |
|---|---|
| `STRING_CONEXAO` | URI de conexão do MongoDB (Atlas `mongodb+srv://...` ou local `mongodb://127.0.0.1:27017/trabalho_web`) |
| `SESSION_SECRET` | Segredo para assinar o cookie de sessão |
| `PORTA` | Porta local (opcional, padrão 3000) |
| `DNS_SERVERS` | Opcional: DNS público (ex.: `8.8.8.8,1.1.1.1`) caso a rede não resolva o SRV do Atlas |

## Deploy (Render)

1. Em [render.com](https://render.com), entre com GitHub e crie um **Web Service**
   (ou um **Blueprint** a partir do `render.yaml` deste repositório).
2. Build: `npm install` · Start: `npm start` · Plano: Free.
3. Defina as variáveis `STRING_CONEXAO` (Atlas) e `SESSION_SECRET`.
4. No MongoDB Atlas, em **Network Access**, libere o acesso (`0.0.0.0/0`) para o
   host conseguir conectar.

## Autores

- Arthur Secundino
- Luiz Gustavo
