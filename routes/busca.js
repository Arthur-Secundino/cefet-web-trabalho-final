import express from "express";
import { busca } from "../models/consultas.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const termo = req.query.nome || "";
        const filtros = { genero: req.query.genero, notaMinima: req.query.notaMinima };
        const resultados = termo ? await busca(termo, filtros) : [];
        res.render("busca", {
            termo,
            genero: req.query.genero || "",
            notaMinima: req.query.notaMinima || "",
            resultados,
            buscou: !!termo,
        });
    } catch (erro) {
        erro.friendlyMessage = "Erro ao exibir a busca";
        next(erro);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const resultados = await busca(req.body.nome, req.body.filtros);

        if (!resultados || resultados.length === 0) {
            req.flash("error", "Nada encontrado para essa busca");
            res.redirect("/busca");
            return;
        }

        res.render("busca", { termo: req.body.nome, resultados });
    } catch (erro) {
        erro.friendlyMessage = "Erro desconhecido ao realizar a busca";
        next(erro);
    }
});

export default router;
