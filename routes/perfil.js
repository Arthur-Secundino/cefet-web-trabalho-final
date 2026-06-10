import express from "express";
import { getDadosUsuario } from "../models/consultas.js";

const router = express.Router();

// "/perfil" sem id: leva ao perfil do próprio usuário logado.
router.get("/", (req, res) => {
    if (!req.session.usuario) {
        req.flash("error", "Faça login para ver seu perfil.");
        return res.redirect("/");
    }
    res.redirect(`/perfil/${req.session.usuario.id}`);
});

// Perfil público de qualquer usuário, visível por URL.
router.get("/:idUsuario", async (req, res, next) => {
    try {
        const dadosUsuario = await getDadosUsuario(req.params.idUsuario);
        if (!dadosUsuario) {
            req.flash("error", "Usuário não encontrado.");
            return res.redirect("/home");
        }
        res.render("perfil", dadosUsuario);
    } catch (erro) {
        erro.friendlyMessage = "Erro desconhecido ao exibir perfil";
        next(erro);
    }
});

export default router;
