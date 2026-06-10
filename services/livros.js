// Serviço de integração com a API pública da OpenLibrary.
// Gratuita, sem chave e sem rate limit agressivo. Documentação:
// https://openlibrary.org/developers/api

const BUSCA = "https://openlibrary.org/search.json";
const CAPA = "https://covers.openlibrary.org/b/id"; // {id}-M.jpg
const SEM_CAPA = "/imgs/crime_castigo.png";

// Monta a URL da capa a partir do id de capa da OpenLibrary.
function urlCapa(coverId) {
    return coverId ? `${CAPA}/${coverId}-M.jpg` : SEM_CAPA;
}

// O id de uma obra vem como "/works/OL12345W"; guardamos só "OL12345W".
function extraiId(key) {
    return key ? key.replace("/works/", "") : null;
}

// Converte um resultado de busca cru no formato simples que nossas views usam.
function normalizaDaBusca(doc) {
    return {
        livroId: extraiId(doc.key),
        titulo: doc.title || "Sem título",
        autor: (doc.author_name && doc.author_name.join(", ")) || "Autor desconhecido",
        sinopse:
            (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence) ||
            "Sem sinopse disponível.",
        capa: urlCapa(doc.cover_i),
        generos: doc.subject ? doc.subject.slice(0, 5) : [],
        notaExterna: doc.ratings_average ? Number(doc.ratings_average.toFixed(1)) : null,
    };
}

// Busca uma lista de livros por termo. `filtros` aceita { genero, notaMinima }.
export async function buscaLivros(termo, filtros = {}) {
    if (!termo || !termo.trim()) return [];

    const params = new URLSearchParams({
        q: termo,
        limit: "20",
        fields: "key,title,author_name,cover_i,first_sentence,subject,ratings_average",
    });
    const resposta = await fetch(`${BUSCA}?${params}`);
    if (!resposta.ok) {
        throw new Error(`OpenLibrary respondeu ${resposta.status}`);
    }

    const dados = await resposta.json();
    let livros = (dados.docs || []).map(normalizaDaBusca);

    if (filtros.genero) {
        const alvo = filtros.genero.toLowerCase();
        livros = livros.filter((l) => l.generos.some((g) => g.toLowerCase().includes(alvo)));
    }
    if (filtros.notaMinima) {
        const minima = Number(filtros.notaMinima);
        livros = livros.filter((l) => (l.notaExterna || 0) >= minima);
    }

    return livros;
}

// Resolve o nome de um autor a partir da sua key (ex.: "/authors/OL23919A").
async function nomeAutor(authorKey) {
    try {
        const r = await fetch(`https://openlibrary.org${authorKey}.json`);
        if (!r.ok) return null;
        const a = await r.json();
        return a.name || null;
    } catch {
        return null;
    }
}

// Busca um único livro (obra) pelo id da OpenLibrary, com sinopse e autor.
export async function buscaLivroPorId(livroId) {
    if (!livroId) return null;

    const resposta = await fetch(`https://openlibrary.org/works/${encodeURIComponent(livroId)}.json`);
    if (resposta.status === 404) return null;
    if (!resposta.ok) {
        throw new Error(`OpenLibrary respondeu ${resposta.status}`);
    }

    const obra = await resposta.json();

    // A descrição pode vir como string ou como objeto { value }.
    const sinopse =
        (typeof obra.description === "string" ? obra.description : obra.description?.value) ||
        "Sem sinopse disponível.";

    // Pega o nome do primeiro autor, se houver.
    let autor = "Autor desconhecido";
    const primeiroAutor = obra.authors?.[0]?.author?.key;
    if (primeiroAutor) {
        autor = (await nomeAutor(primeiroAutor)) || autor;
    }

    return {
        livroId,
        titulo: obra.title || "Sem título",
        autor,
        sinopse,
        capa: urlCapa(obra.covers?.[0]),
        generos: obra.subjects ? obra.subjects.slice(0, 5) : [],
        notaExterna: null,
    };
}
