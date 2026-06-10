import "dotenv/config";
import express from "express";
import hbs from "hbs";
import http from "http";
import session from "express-session";
import flash from "connect-flash";

import homeRouter from "./routes/home.js";
import prateleiraRouter from "./routes/prateleira.js";
import livroRouter from "./routes/livro.js";
import buscaRouter from "./routes/busca.js";
import perfilRouter from "./routes/perfil.js";
import authRouter from "./routes/auth.js";

// Middleware de autorização: barra quem não está logado.
function requireAuth(req, res, next) {
    if (!req.session.usuario) {
        req.flash("error", "Faça login para acessar essa página.");
        return res.redirect("/");
    }
    next();
}

const PORTA = process.env.PORTA || 3000;

const app = express();
app.set("port", PORTA);

// Arquivos estáticos (CSS, JS de front e imagens). index:false para que "/"
// seja tratado pela rota SSR da landing, não pelo index.html estático.
app.use(express.static("public", { index: false }));

// Parsers de corpo: JSON para chamadas fetch e urlencoded para formulários HTML.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessão (necessária para o connect-flash e, na Fase 3, para a autenticação).
app.use(
    session({
        secret: process.env.SESSION_SECRET || "shelflog-dev-secret",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(flash());

// Disponibiliza as mensagens flash e o usuário logado para todas as views.
app.use((req, res, next) => {
    res.locals.mensagensSucesso = req.flash("success");
    res.locals.mensagensErro = req.flash("error");
    res.locals.usuario = req.session.usuario || null;
    next();
});

app.set("views", "./views");
app.set("view engine", "hbs");

// Landing page (SSR). Se já estiver logado, vai direto para a home.
app.get("/", (req, res) => {
    if (req.session.usuario) return res.redirect("/home");
    res.render("landing");
});

// Autenticação (cadastro, login, logout).
app.use("/", authRouter);

// Rotas da aplicação (SSR com Handlebars).
app.use("/home", homeRouter);
app.use("/prateleira", requireAuth, prateleiraRouter); // só do usuário logado
app.use("/livro", livroRouter);
app.use("/busca", buscaRouter);
app.use("/perfil", perfilRouter);

// Handler de erro central: as rotas chamam next(erro) e caímos aqui.
app.use((erro, req, res, next) => {
    console.error(erro);
    res.status(500).render("erro", {
        mensagem: erro.friendlyMessage || "Ocorreu um erro inesperado.",
    });
});

const servidor = http.createServer(app);
// Sem host explícito: escuta em todas as interfaces (IPv4 e IPv6), evitando
// a ambiguidade de "localhost" resolver só para ::1 no Windows.
servidor.listen(PORTA, () => {
    console.log(`Servidor ShelfLog rodando em http://localhost:${PORTA}`);
});
