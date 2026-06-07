import express from "express";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try{
        const prateleiras = await getPrateleiras();
        res.render("prateleira", {prateleiras});
    }
    catch(erro){
        console.log(erro);
        erro.friendlyMessage = "Erro ao buscar prateleiras";
        next(erro);
    }
});

router.post("/", async (req, res, next) => {
    const novaPrateleira = {
        nome: req.body.nome,
        descricao: req.body.descricao,
        livros: []
    };

    try{
        const resultado = await criaNovaPrateleira(novaPrateleira);
        if(criaNovaPrateleira){
            req.flash("success", "Prateleira criada com sucesso");
        }
        else{
            req.flash("error", "Não foi possível criar a prateleira");
        }
        res.redirect("/");
    }
    catch(erro){
        console.log(erro);
        erro.friendlyMessage = "Erro ao criar prateleira";
        next(erro);
    }
});

router.post("/:idPrateleira", async (req, res, next) => {
    try{
        const livro = await getDadosLivro(req.body.titulo);

        const novoLivro = {
            titulo: req.body.titulo,
            capa: livro.linkCapa,
            status: livro.status,
            nota: livro.nota
        };

        const livroInserido = await insereLivroNaPrateleira(req.params.idPrateleira);
        if(livroInserido){
            req.flash("success", "Livro adicionado com sucesso");
        }
        else{
            req.flash("error", "Não foi possível inserir o livro na prateleira");
        }
        res.redirect("/");
    }
    catch(erro){
        console.log(erro);
        erro.friendlyMessage = "Erro ao adicionar livro na prateleira";
        next(erro);
    }
})