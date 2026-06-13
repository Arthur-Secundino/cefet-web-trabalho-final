import express from "express";
import { getPrateleiras, getAvaliacoes, getUsuarioPorId } from "../models/consultas.js";
import { buscaLivros, buscaLivroPorId } from "../services/livros.js";

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

        let reviewsRecentes = [];
        try{
            const avaliacoes = await getAvaliacoes();
            const avaliacoesRecentes = avaliacoes.sort((a, b) => {
                if(a.criadoEm < b.criadoEm){
                    return 1;
                }
                else if(a.criadoEm === b.criadoEm){
                    return 0;
                }
                else{
                    return -1;
                }
            }).slice(0, 6);

            reviewsRecentes = await Promise.all(
                avaliacoesRecentes.map(async (avl) => {
                    const liv = await buscaLivroPorId(avl.livroId);
                    const usu = await getUsuarioPorId(avl.idUsuario);
            
                    return {
                        avaliacao: avl,
                        livro: liv,
                        usuario: usu
                    };
                })
            );

        }
        catch(erroBanco){
            console.warn("Banco indisponível na home:", erroBanco.message)
        }

        res.render("home", {
            livrosEmAlta,
            prateleirasEmAlta,
            reviewsRecentes // TODO (Fase 3): juntar avaliações + usuários
        });
    } catch (erro) {
        erro.friendlyMessage = "Erro ao carregar a home";
        next(erro);
    }
});

export default router;
