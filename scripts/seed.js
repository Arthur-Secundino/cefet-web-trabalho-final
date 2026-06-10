// Popula o banco com dados de exemplo para desenvolvimento.
// Uso: configure o .env com STRING_CONEXAO e rode `node scripts/seed.js`.
//
// ATENÇÃO: este script LIMPA as coleções usuarios, prateleiras e avaliacoes
// antes de inserir os exemplos.

import "dotenv/config";
import bcrypt from "bcrypt";
import { getDb } from "../config/dbConfig.js";

async function semear() {
    const db = await getDb();

    console.log("Limpando coleções antigas...");
    await Promise.all([
        db.collection("usuarios").deleteMany({}),
        db.collection("prateleiras").deleteMany({}),
        db.collection("avaliacoes").deleteMany({}),
    ]);

    const senhaHash = await bcrypt.hash("123456", 10);

    console.log("Inserindo usuários...");
    const { insertedIds } = await db.collection("usuarios").insertMany([
        {
            nome: "Arthur",
            arroba: "@Tuzinho",
            email: "arthur@exemplo.com",
            senhaHash,
            avatar: "/imgs/avatar.png",
            textoExplicativo: "Apaixonado por literatura russa.",
            criadoEm: new Date("2024-01-15"),
        },
        {
            nome: "Luiz Gustavo",
            arroba: "@LuizG",
            email: "luiz@exemplo.com",
            senhaHash,
            avatar: "/imgs/avatar.png",
            textoExplicativo: "Lendo um pouco de tudo.",
            criadoEm: new Date("2024-03-02"),
        },
    ]);

    const arthurId = insertedIds[0];
    const luizId = insertedIds[1];

    console.log("Inserindo prateleiras...");
    await db.collection("prateleiras").insertMany([
        {
            idUsuario: arthurId,
            nome: "Clássicos Russos",
            descricao: "Os grandes nomes da literatura russa.",
            publica: true,
            livros: [
                {
                    livroId: "exemplo-crime-castigo",
                    titulo: "Crime e Castigo",
                    capa: "/imgs/crime_castigo.png",
                    status: "Lido",
                    nota: 5,
                },
            ],
            criadoEm: new Date(),
        },
        {
            idUsuario: luizId,
            nome: "Terror Clássico",
            descricao: "Histórias que traumatizaram gerações.",
            publica: true,
            livros: [],
            criadoEm: new Date(),
        },
    ]);

    console.log("Inserindo avaliações...");
    await db.collection("avaliacoes").insertOne({
        livroId: "exemplo-crime-castigo",
        idUsuario: arthurId,
        nota: 5,
        comentario: "Clássico da literatura russa, simplesmente fantástico.",
        tituloLivro: "Crime e Castigo",
        criadoEm: new Date(),
    });

    console.log("Seed concluído. Usuários de teste: senha '123456'.");
    process.exit(0);
}

semear().catch((erro) => {
    console.error("Falha no seed:", erro);
    process.exit(1);
});
