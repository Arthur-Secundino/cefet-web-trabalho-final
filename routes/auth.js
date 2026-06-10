import express from "express";
import bcrypt from "bcrypt";
import { criaUsuario, buscaUsuarioPorEmail } from "../models/consultas.js";

const router = express.Router();

// Gera um "@arroba" simples a partir do nome (sem espaços/acentos).
function geraArroba(nome) {
    const base = nome
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, "");
    return "@" + (base || "user");
}

// Guarda o usuário na sessão (sem a senha) após cadastro/login.
function logaNaSessao(req, usuario) {
    req.session.usuario = {
        id: usuario._id.toString(),
        nome: usuario.nome,
        arroba: usuario.arroba,
    };
}

// --- CADASTRO ---
router.post("/cadastro", async (req, res, next) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            req.flash("error", "Preencha nome, email e senha.");
            return res.redirect("/");
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        const idNovo = await criaUsuario({
            nome,
            email,
            senhaHash,
            arroba: geraArroba(nome),
        });

        if (!idNovo) {
            req.flash("error", "Já existe uma conta com esse email ou nome.");
            return res.redirect("/");
        }

        logaNaSessao(req, { _id: idNovo, nome, arroba: geraArroba(nome) });
        res.redirect("/home");
    } catch (erro) {
        erro.friendlyMessage = "Erro ao criar a conta";
        next(erro);
    }
});

// --- LOGIN ---
router.post("/login", async (req, res, next) => {
    try {
        const { email, senha } = req.body;
        const usuario = await buscaUsuarioPorEmail(email);

        if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
            req.flash("error", "Email ou senha incorretos.");
            return res.redirect("/");
        }

        logaNaSessao(req, usuario);
        res.redirect("/home");
    } catch (erro) {
        erro.friendlyMessage = "Erro ao fazer login";
        next(erro);
    }
});

// --- LOGOUT --- (GET para funcionar como link simples no menu)
router.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

export default router;
