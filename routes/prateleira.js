import express from "express";
import {
    getPrateleiras,
    criaNovaPrateleira,
    getDadosLivro,
    insereLivroNaPrateleira,
    getPrateleiraPorId,
} from "../models/consultas.js";

const router = express.Router();

// Lista as prateleiras DO usuário logado (este router é protegido no app.js).
router.get("/", async (req, res, next) => {
    try {
        const dadosPrateleiras = (await getPrateleiras(req.session.usuario.id)).map((p) => ({
            ...p,
            id: p._id.toString(),
        }));
        res.render("prateleira", { prateleiras: dadosPrateleiras });
    } catch (erro) {
        erro.friendlyMessage = "Erro ao buscar prateleiras";
        next(erro);
    }
});

// Cria uma prateleira pertencente ao usuário logado.
router.post("/", async (req, res, next) => {
    const novaPrateleira = {
        nome: req.body.nome,
        descricao: req.body.descricao,
        livros: [],
        idUsuario: req.session.usuario.id,
    };

    try {
        const criada = await criaNovaPrateleira(novaPrateleira);
        req.flash(criada ? "success" : "error", criada ? "Prateleira criada com sucesso" : "Não foi possível criar a prateleira");
        res.redirect("/prateleira");
    } catch (erro) {
        erro.friendlyMessage = "Erro ao criar prateleira";
        next(erro);
    }
});

// Adiciona um livro a uma prateleira (só se ela for do usuário logado).
router.post("/:idPrateleira", async (req, res, next) => {
    try {
        const prateleira = await getPrateleiraPorId(req.params.idPrateleira);

        // Autorização: a prateleira existe e pertence ao usuário logado?
        if (!prateleira || prateleira.idUsuario?.toString() !== req.session.usuario.id) {
            req.flash("error", "Você não pode alterar essa prateleira.");
            return res.redirect("/prateleira");
        }

        const livro = await getDadosLivro(null, req.body.titulo);
        if (!livro) {
            req.flash("error", "Livro não encontrado.");
            return res.redirect("/prateleira");
        }

        const novoLivro = {
            livroId: livro.livroId,
            titulo: livro.titulo,
            capa: livro.capa,
            status: req.body.status || "Quero ler",
            nota: livro.notaExterna || "-",
        };

        const inserido = await insereLivroNaPrateleira(req.params.idPrateleira, novoLivro);
        req.flash(inserido ? "success" : "error", inserido ? "Livro adicionado com sucesso" : "Não foi possível inserir o livro");
        res.redirect("/prateleira");
    } catch (erro) {
        erro.friendlyMessage = "Erro ao adicionar livro na prateleira";
        next(erro);
    }
});

export default router;
