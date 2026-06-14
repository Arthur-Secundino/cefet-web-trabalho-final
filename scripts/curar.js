import "dotenv/config";
import { getDb } from "../config/dbConfig.js";
import { buscaLivros } from "../services/livros.js";

const CURADAS = [
    {
        nome: "Clássicos Russos",
        descricao: "Os grandes nomes da literatura russa.",
        titulos: ["Crime e Castigo Dostoiévski", "Anna Kariênina Tolstói", "Os Irmãos Karamázov"],
    },
    {
        nome: "Terror Clássico",
        descricao: "Histórias que traumatizaram gerações.",
        titulos: ["Drácula Bram Stoker", "Frankenstein Mary Shelley", "O Iluminado Stephen King"],
    },
];

async function curar() {
    const db = await getDb();
    const dono = await db.collection("usuarios").findOne({});

    for (const c of CURADAS) {
        const livros = [];
        for (const titulo of c.titulos) {
            const achados = await buscaLivros(titulo);
            const l = achados[0];
            if (l) {
                livros.push({
                    livroId: l.livroId,
                    titulo: l.titulo,
                    capa: l.capa,
                    status: "Lido",
                    nota: l.notaExterna || "-",
                });
            }
        }

        await db.collection("prateleiras").updateOne(
            { nome: c.nome },
            {
                $set: {
                    nome: c.nome,
                    descricao: c.descricao,
                    publica: true,
                    livros,
                    idUsuario: dono?._id || null,
                    criadoEm: new Date(),
                },
            },
            { upsert: true }
        );
        console.log(`Prateleira "${c.nome}" curada com ${livros.length} livros.`);
    }
    process.exit(0);
}

curar().catch((e) => { console.error("Falha na curadoria:", e); process.exit(1); });