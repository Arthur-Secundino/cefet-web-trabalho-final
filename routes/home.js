import express from "express";
import { getPrateleiras, getAvaliacoes, getUsuarioPorId } from "../models/consultas.js";
import { buscaLivros, buscaLivroPorId } from "../services/livros.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        // Prateleiras públicas: base do "Em alta" e do "Prateleiras pra se inspirar".
        let prateleirasPublicas = [];
        try {
            prateleirasPublicas = await getPrateleiras(); // sem id => só as públicas
        } catch (erroBanco) {
            console.warn("Banco indisponível na home:", erroBanco.message);
        }

        // "Em alta": livros reais e distintos que estão nas prateleiras públicas.
        const vistos = new Set();
        let livrosEmAlta = [];
        for (const p of prateleirasPublicas) {
            for (const liv of p.livros || []) {
                if (liv.livroId && !vistos.has(liv.livroId)) {
                    vistos.add(liv.livroId);
                    livrosEmAlta.push({ livroId: liv.livroId, titulo: liv.titulo, capa: liv.capa });
                }
            }
        }
        livrosEmAlta = livrosEmAlta.slice(0, 8);

        // Fallback: se ainda não há livros nas prateleiras, busca na OpenLibrary só com capa real.
        if (livrosEmAlta.length === 0) {
            try {
                livrosEmAlta = (await buscaLivros("classic literature"))
                    .filter((l) => l.capa && !l.capa.endsWith("crime_castigo.png"))
                    .slice(0, 8);
            } catch (erroApi) {
                console.warn("OpenLibrary indisponível na home:", erroApi.message);
            }
        }

        // "Prateleiras pra se inspirar": as próprias prateleiras públicas com seus livros (faixa de capas).
        const prateleirasEmAlta = prateleirasPublicas.slice(0, 3).map((p) => ({
            id: p._id.toString(),
            nome: p.nome,
            descricao: p.descricao,
            livros: (p.livros || []).slice(0, 8),
        }));

        // Reviews recentes (avaliações + autor).
        let reviewsRecentes = [];
        try {
            const avaliacoes = await getAvaliacoes();
            const recentes = avaliacoes
                .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
                .slice(0, 6);
            reviewsRecentes = await Promise.all(
                recentes.map(async (avl) => ({
                    avaliacao: avl,
                    livro: await buscaLivroPorId(avl.livroId),
                    usuario: await getUsuarioPorId(avl.idUsuario),
                }))
            );
        } catch (erroBanco) {
            console.warn("Banco indisponível na home (reviews):", erroBanco.message);
        }

        res.render("home", { livrosEmAlta, prateleirasEmAlta, reviewsRecentes });
    } catch (erro) {
        erro.friendlyMessage = "Erro ao carregar a home";
        next(erro);
    }
});

export default router;