import express from "express";
import { getPrateleiras } from "../models/consultas.js";
import { buscaLivros } from "../services/livros.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        // "Em alta" vem da API do Google Books, não depende do nosso banco.
        let livrosEmAlta = [];
        try {
            livrosEmAlta = (await buscaLivros("best sellers literatura")).slice(0, 6);
        } catch (erroApi) {
            console.warn("Google Books indisponível na home:", erroApi.message);
        }

        // Prateleiras em destaque dependem do banco. Se ele ainda não estiver
        // configurado, a home continua abrindo (lista vazia) em vez de quebrar.
        let prateleirasEmAlta = [];
        try {
            const prateleiras = await getPrateleiras();
            prateleirasEmAlta = prateleiras.map((p) => ({
                imagem: p.livros?.[0]?.capa || "/imgs/terror_classico.png",
                nome: p.nome,
                descricao: p.descricao,
            }));
        } catch (erroBanco) {
            console.warn("Banco indisponível na home:", erroBanco.message);
        }

        res.render("home", {
            livrosEmAlta,
            prateleirasEmAlta,
            reviewsRecentes: [], // TODO (Fase 3): juntar avaliações + usuários
        });
    } catch (erro) {
        erro.friendlyMessage = "Erro ao carregar a home";
        next(erro);
    }
});

export default router;
