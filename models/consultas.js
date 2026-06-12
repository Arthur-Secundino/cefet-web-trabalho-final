import { ObjectId } from "mongodb";
import { getDb } from "../config/dbConfig.js";
import { buscaLivros, buscaLivroPorId } from "../services/livros.js";

// Coleções persistidas no Mongo: usuarios, prateleiras, avaliacoes.
// Os LIVROS não são salvos: vêm da API da OpenLibrary sob demanda. Prateleiras
// e avaliações apenas referenciam o livro pelo livroId (guardando um "retrato"
// de titulo/capa para exibição rápida).

// Converte uma string em ObjectId com segurança (retorna null se inválida).
function paraObjectId(id) {
    try {
        return new ObjectId(id);
    } catch {
        return null;
    }
}

// --- PRATELEIRAS ---------------------------------------------------------

// Lista as prateleiras. Se um idUsuario for passado, traz só as dele;
// senão traz as públicas (vitrine para visitantes).
export async function getPrateleiras(idUsuario) {
    const db = await getDb();
    const filtro = idUsuario ? { idUsuario: paraObjectId(idUsuario) } : { publica: true };
    return db.collection("prateleiras").find(filtro).sort({ criadoEm: -1 }).toArray();
}

// Cria uma prateleira nova. Espera { nome, descricao, livros, idUsuario? }.
export async function criaNovaPrateleira(novaPrateleira) {
    const db = await getDb();
    const documento = {
        nome: novaPrateleira.nome,
        descricao: novaPrateleira.descricao,
        livros: novaPrateleira.livros || [],
        publica: novaPrateleira.publica ?? true,
        idUsuario: novaPrateleira.idUsuario ? paraObjectId(novaPrateleira.idUsuario) : null,
        criadoEm: new Date(),
    };
    const resultado = await db.collection("prateleiras").insertOne(documento);
    return resultado.acknowledged;
}

// Adiciona um livro (retrato) ao array de livros de uma prateleira.
export async function insereLivroNaPrateleira(idPrateleira, novoLivro) {
    const db = await getDb();
    const _id = paraObjectId(idPrateleira);
    if (!_id) return false;

    const resultado = await db
        .collection("prateleiras")
        .updateOne({ _id }, { $push: { livros: novoLivro } });
    return resultado.modifiedCount > 0;
}

// --- LIVROS (via OpenLibrary + avaliações nossas) ------------------------

// Retorna os dados de um livro pelo id da OpenLibrary (ou pelo nome, pegando o 1º).
// Anexa as avaliações que os usuários fizeram desse livro no nosso sistema.
export async function getDadosLivro(idLivro, nomeLivro) {
    const livro = idLivro
        ? await buscaLivroPorId(idLivro)
        : (await buscaLivros(nomeLivro))[0] || null;

    if (!livro) return null;

    // As avaliações dependem do banco. Se ele não estiver disponível, a página
    // do livro ainda abre (sem avaliações) em vez de quebrar.
    let avaliacoes = [];
    try {
        const db = await getDb();
        avaliacoes = await db
            .collection("avaliacoes")
            .find({ livroId: livro.livroId })
            .sort({ criadoEm: -1 })
            .toArray();
    } catch (erro) {
        console.warn("Banco indisponível ao buscar avaliações:", erro.message);
    }

    return { ...livro, avaliacoes };
}

// --- AVALIAÇÕES ----------------------------------------------------------

// Cria ou atualiza a avaliação de um usuário para um livro (uma por par).
// Espera avaliacao = { nota, comentario, idUsuario }.
export async function avaliaLivro(idLivro, avaliacao) {
    const db = await getDb();
    const filtro = {
        livroId: idLivro,
        idUsuario: avaliacao.idUsuario ? paraObjectId(avaliacao.idUsuario) : null,
    };
    const resultado = await db.collection("avaliacoes").updateOne(
        filtro,
        {
            $set: {
                nota: Number(avaliacao.nota),
                comentario: avaliacao.comentario,
                tituloLivro: avaliacao.tituloLivro || "",
                criadoEm: new Date(),
            },
        },
        { upsert: true }
    );
    return resultado.acknowledged;
}

// --- USUÁRIO / PERFIL ----------------------------------------------------

// Monta os dados do perfil público: dados básicos + estatísticas calculadas
// a partir das avaliações e prateleiras do usuário.
export async function getDadosUsuario(idUsuario) {
    const db = await getDb();
    const _id = paraObjectId(idUsuario);
    if (!_id) return null;

    const usuario = await db.collection("usuarios").findOne({ _id });
    if (!usuario) return null;

    const avaliacoes = await db.collection("avaliacoes").find({ idUsuario: _id }).toArray();
    const prateleiras = await db.collection("prateleiras").find({ idUsuario: _id }).toArray();

    const notaMedia = avaliacoes.length
        ? (avaliacoes.reduce((soma, a) => soma + (a.nota || 0), 0) / avaliacoes.length).toFixed(1)
        : "0.0";

    return {
        nome: usuario.nome,
        arroba: usuario.arroba,
        avatar: usuario.avatar || "/imgs/avatar.png",
        anoDeIngresso: usuario.criadoEm ? new Date(usuario.criadoEm).getFullYear() : "—",
        textoExplicativo: usuario.textoExplicativo || "",
        grafico: "/imgs/grafico_estatisticas.png",
        quantidadeLivrosLidos: avaliacoes.length,
        notaMedia,
        livroMaisRecenteLido: avaliacoes[0]?.tituloLivro || "—",
        livroMaisRecenteAvaliado: avaliacoes[0]?.tituloLivro || "—",
        prateleirasPublicas: prateleiras
            .filter((p) => p.publica)
            .map((p) => ({ nomePrateleira: p.nome })),
    };
}

// --- BUSCA ---------------------------------------------------------------

// Busca livros pela API da OpenLibrary, aplicando filtros opcionais.
export async function busca(nome, filtros) {
    return buscaLivros(nome, filtros || {});
}

// --- USUÁRIOS (cadastro / autenticação) ----------------------------------

// Cria um usuário. Espera { nome, arroba, email, senhaHash }.
// Retorna o _id criado, ou null se o email/arroba já existir.
export async function criaUsuario(dados) {
    const db = await getDb();
    const usuarios = db.collection("usuarios");

    const jaExiste = await usuarios.findOne({
        $or: [{ email: dados.email }, { arroba: dados.arroba }],
    });
    if (jaExiste) return null;

    const documento = {
        nome: dados.nome,
        arroba: dados.arroba,
        email: dados.email,
        senhaHash: dados.senhaHash,
        avatar: "/imgs/avatar.png",
        textoExplicativo: "",
        criadoEm: new Date(),
    };
    const resultado = await usuarios.insertOne(documento);
    return resultado.insertedId;
}

// Busca um usuário pelo email (usado no login). Retorna o documento completo.
export async function buscaUsuarioPorEmail(email) {
    const db = await getDb();
    return db.collection("usuarios").findOne({ email });
}

// Retorna a prateleira pelo id (usado para checar dono na autorização).
export async function getPrateleiraPorId(idPrateleira) {
    const db = await getDb();
    const _id = paraObjectId(idPrateleira);
    if (!_id) return null;
    return db.collection("prateleiras").findOne({ _id });
}

// --- RECUPERAÇÃO DE SENHA -------------------------------------------------

// Guarda um token de redefinição (validade de 1 hora) para o usuário do email.
// Retorna o usuário, ou null se o email não estiver cadastrado.
export async function criaTokenRedefinicao(email, token) {
    const db = await getDb();
    const usuario = await db.collection("usuarios").findOne({ email });
    if (!usuario) return null;

    await db.collection("usuarios").updateOne(
        { _id: usuario._id },
        { $set: { resetToken: token, resetExpira: new Date(Date.now() + 60 * 60 * 1000) } }
    );
    return usuario;
}

// Busca o usuário dono de um token ainda válido (não expirado).
export async function buscaUsuarioPorToken(token) {
    const db = await getDb();
    return db.collection("usuarios").findOne({
        resetToken: token,
        resetExpira: { $gt: new Date() },
    });
}

// Grava a nova senha e invalida o token.
export async function redefineSenha(idUsuario, senhaHash) {
    const db = await getDb();
    const resultado = await db.collection("usuarios").updateOne(
        { _id: paraObjectId(idUsuario) },
        { $set: { senhaHash }, $unset: { resetToken: "", resetExpira: "" } }
    );
    return resultado.modifiedCount > 0;
}