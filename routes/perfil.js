import express from "express";

const router = express.Router();

router.get("/:idUsuario", async (req, res, next) => {
    try{
        const dadosUsuario = await getDadosUsuario();
        res.render("perfil", {dados: dadosUsuario});
    }
    catch(erro){
        console.log(erro);
        erro.friendlyMessage = "Erro desconhecido ao exibir perfil";
        next(erro);
    }
});

router.post("/:idUsuario", async (req, res, next) => {
    try{
        
    }
    catch(erro){
        console.log(erro);
        erro.friendlyMessage = "Erro desconhecido ao atualizar perfil";
        next(erro);
    }
});

export default router;