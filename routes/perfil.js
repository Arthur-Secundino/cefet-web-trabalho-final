import express from "express";
import { getDadosUsuario, buscaUsuarioPorNome } from "../models/consultas.js";

const router = express.Router();

// "/perfil" sem id: leva ao perfil do próprio usuário logado.
router.get("/", (req, res) => {
    if (!req.session.usuario) {
        req.flash("error", "Faça login para ver seu perfil.");
        return res.redirect("/");
    }
    res.redirect(`/perfil/${req.session.usuario.id}`);
});

// rota para busca pelo nome do usuário
router.get("/buscar", async (req, res, next) => {
    const nomeBuscado = req.query.nome?.trim();

    if (!nomeBuscado) {
        return res.redirect('/perfil'); // renderizar perfil do usuário logado
    }
    
    try{
        const idUsuario = await buscaUsuarioPorNome(nomeBuscado);

        if(!idUsuario) {
            req.flash("error", `Nenhum usuário encontrado com o nome "${nomeBuscado}"`);

            return res.render('perfil', {
                nomeBuscado
            });
        }

        // Redireciona para a rota com id
        res.redirect(`/perfil/${idUsuario}`);
    }
    catch(erro){
        erro.friendlyMessage = "Erro desconhecido ao buscar perfil";
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
