import express from "express";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import {
    criaUsuario,
    buscaUsuarioPorEmail,
    criaTokenRedefinicao,
    buscaUsuarioPorToken,
    redefineSenha,
} from "../models/consultas.js";
import { enviaEmail } from "../services/email.js";


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

        // Email de boas-vindas (não bloqueia o cadastro se o envio falhar).
        enviaEmail(
            email,
            "Bem-vindo ao ShelfLog!",
            `<h2>Olá, ${nome}!</h2><p>Sua conta no ShelfLog foi criada. Monte suas prateleiras e boas leituras!</p>`
        ).catch((e) => console.warn("Falha no email de boas-vindas:", e.message));

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

// --- ESQUECI MINHA SENHA ---
router.get("/esqueci-senha", (req, res) => {
    res.render("esqueci_senha");
});

router.post("/esqueci-senha", async (req, res, next) => {
    try {
        const token = crypto.randomBytes(32).toString("hex");
        const usuario = await criaTokenRedefinicao(req.body.email, token);

        if (usuario) {
            const link = `${req.protocol}://${req.get("host")}/redefinir-senha/${token}`;

            // Tenta enviar por email, mas SEM quebrar o fluxo se o SMTP falhar.
            let enviado = false;
            try {
                enviado = await enviaEmail(
                    req.body.email,
                    "Redefinição de senha · ShelfLog",
                    `<p>Para redefinir sua senha, acesse: <a href="${link}">${link}</a></p><p>O link vale por 1 hora.</p>`
                );
            } catch (e) {
                console.warn("Falha no envio do email de redefinição:", e.message);
            }

            // Mostra o link na tela SEMPRE, garantindo o fluxo mesmo sem email entregue.
            req.flash(
                "success",
                enviado
                    ? `Enviamos um email com o link. Se não chegar, use este: ${link}`
                    : `Link de redefinição (vale por 1 hora): ${link}`
            );
        } else {
            req.flash("success", "Se este email estiver cadastrado, geramos um link de redefinição.");
        }

        res.redirect("/esqueci-senha");
    } catch (erro) {
        erro.friendlyMessage = "Erro ao iniciar a redefinição de senha";
        next(erro);
    }
});

router.get("/redefinir-senha/:token", async (req, res, next) => {
    try {
        const usuario = await buscaUsuarioPorToken(req.params.token);
        if (!usuario) {
            req.flash("error", "Link inválido ou expirado. Peça uma nova redefinição.");
            return res.redirect("/esqueci-senha");
        }
        res.render("redefinir_senha", { token: req.params.token });
    } catch (erro) {
        erro.friendlyMessage = "Erro ao abrir a redefinição de senha";
        next(erro);
    }
});

router.post("/redefinir-senha/:token", async (req, res, next) => {
    try {
        const usuario = await buscaUsuarioPorToken(req.params.token);
        if (!usuario) {
            req.flash("error", "Link inválido ou expirado. Peça uma nova redefinição.");
            return res.redirect("/esqueci-senha");
        }
        if (!req.body.senha || req.body.senha !== req.body.confirmar) {
            req.flash("error", "As senhas não coincidem.");
            return res.redirect(`/redefinir-senha/${req.params.token}`);
        }

        const senhaHash = await bcrypt.hash(req.body.senha, 10);
        await redefineSenha(usuario._id, senhaHash);
        req.flash("success", "Senha redefinida com sucesso! Faça login.");
        res.redirect("/");
    } catch (erro) {
        erro.friendlyMessage = "Erro ao redefinir a senha";
        next(erro);
    }
});

export default router;
