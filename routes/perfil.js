import express from "express";
import { getDadosUsuario, buscaUsuariosPorNome } from "../models/consultas.js";
const router = express.Router();

// "/perfil" sem id: leva ao perfil do próprio usuário logado.
router.get("/", (req, res) => {
    if (!req.session.usuario) {
        req.flash("error", "Faça login para ver seu perfil.");
        return res.redirect("/");
    }
    res.redirect(`/perfil/${req.session.usuario.id}`);
});

// Busca de perfis por nome: mostra uma lista de usuários encontrados.
router.get("/buscar", async (req, res, next) => {
    const nomeBuscado = req.query.nome?.trim();
    if (!nomeBuscado) return res.redirect("/perfil");

    try {
        const usuarios = (await buscaUsuariosPorNome(nomeBuscado)).map((u) => ({
            id: u._id.toString(),
            nome: u.nome,
            arroba: u.arroba,
            avatar: u.avatar || "/imgs/avatar.png",
        }));
        res.render("perfil_busca", { nomeBuscado, usuarios });
    } catch (erro) {
        erro.friendlyMessage = "Erro ao buscar perfis";
        next(erro);
    }
});

// Perfil público de qualquer usuário, visível por URL.
router.get("/:idUsuario", async (req, res, next) => {
    try {
        const dadosUsuario = await getDadosUsuario(req.params.idUsuario);
        if (!dadosUsuario) {
            req.flash("error", "Usuário não encontrado.");
            return res.redirect("/home");
        }
        const idUsuario = req.params.idUsuario
        res.render("perfil", { dadosUsuario: dadosUsuario, idUsuario: idUsuario });
    } catch (erro) {
        erro.friendlyMessage = "Erro desconhecido ao exibir perfil";
        next(erro);
    }
});

export default router;
