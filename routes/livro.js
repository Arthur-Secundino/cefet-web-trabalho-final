import express from "express";

const router = express.Router();

router.get("/:idLivro", async (req, res, next) => {
    try{
        const dadosLivro = await getDadosLivro(req.params.idLivro);
        res.render("livro", {livro: dadosLivro});
    }
    catch(erro){
        console.log(erro);
        erro.friendlyMessage = "Erro ao exibir dados do livro";
        next(erro);
    }
});

router.post("/:idLivro", async (req, res, next) => {
    try{
        const avaliacao = {
            nota: req.body.nota,
            comentario: req.body.comentario
        };

        const avaliacaoFeita = await avaliaLivro(req.params.idLivro, avaliacao);
        if(avaliacaoFeita){
            req.flash("success", "Avaliação salva");
        }
        else{
            req.flash("error", "Não foi possível salvar a avaliação");
        }
        res.redirect("/:idLivro");
    }
    catch(erro){
        console.log(erro);
        erro.friendlyMessage("Erro desconhecido ao avaliar livro");
        next(erro);
    }
});

export default router;