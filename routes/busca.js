import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.render("busca", {resultadoBusca: req.body});
});

router.post("/", async (req, res, next) => {
    try{
        const resultadoBusca = busca(req.body.nome, req.body.filtros);

        if(resultadoBusca.length === 0){
            req.flash("error", "Nada encontrado para essa busca");
            res.redirect("/");
            return;
        }

        res.body = resultadoBusca;
        res.redirect("/");
    }
    catch(erro){
        console.log(erro);
        erro.friendlyMessage = "Erro desconhecido ao realizar a busca";
        next(erro);
    }
});

export default router;