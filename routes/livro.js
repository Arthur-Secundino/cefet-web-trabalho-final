import express from "express";
import { getDadosLivro, avaliaLivro } from "../models/consultas.js";

const router = express.Router();

router.get("/:idLivro", async (req, res, next) => {
    try{
        const dadosLivro = await getDadosLivro(req.params.idLivro, null);
        res.render("livro", {
            livro: dadosLivro,
            avaliacoes: dadosLivro?.avaliacoes || [],
        });
    }
    catch(erro){
        console.log(erro);
        erro.friendlyMessage = "Erro ao exibir dados do livro";
        next(erro);
    }
});

router.post("/:idLivro", async (req, res, next) => {
    try{
        // Avaliar exige estar logado.
        if (!req.session.usuario) {
            req.flash("error", "Faça login para avaliar livros.");
            return res.redirect("/");
        }

        const avaliacao = {
            nota: req.body.nota,
            comentario: req.body.comentario,
            idUsuario: req.session.usuario.id,
            tituloLivro: req.body.titulo,
        };

        const avaliacaoFeita = await avaliaLivro(req.params.idLivro, avaliacao);
        if(avaliacaoFeita){
            req.flash("success", "Avaliação salva");
        }
        else{
            req.flash("error", "Não foi possível salvar a avaliação");
        }
        res.redirect(`/livro/${req.params.idLivro}`);
    }
    catch(erro){
        console.log(erro);
        erro.friendlyMessage = "Erro desconhecido ao avaliar livro";
        next(erro);
    }
});

export default router;