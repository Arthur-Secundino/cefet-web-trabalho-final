import { resultadosBusca } from "./dados_busca.js";

const listaResultadosEl = document.querySelector("#lista-resultados");
listaResultadosEl.innerHTML = "";

resultadosBusca.forEach(resultado => {
    listaResultadosEl.innerHTML += `<article class="card">
                                        <img src="${resultado.capa}" alt="Capa do livro ${resultado.titulo}">
                                        <p>${resultado.titulo}</p>
                                        <p>${resultado.sinopse}</p>
                                        <p>${resultado.nota}</p>
                                    </article>`;
});