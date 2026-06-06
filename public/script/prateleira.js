import { prateleiras } from "./dados_prateleira.js";

const listaPrateleirasEl = document.querySelector("#lista-prateleiras");
listaPrateleirasEl.innerHTML = "";

let listaLivros;

prateleiras.forEach(prateleira => {
    listaLivros = "";
    prateleira.livros.forEach(livro => {
        listaLivros += `<article class="card card-com-fundo">
                            <img src="${livro.capa}" alt="Capa do livro ${livro.titulo}">
                            <p>${livro.status}</p>
                            <p>${livro.titulo}</p>
                            <p>${livro.nota}</p>
                        </article>`;
    });

    listaPrateleirasEl.innerHTML += `<div>
                                        <div class="menu-prateleira-especifica">
                                            <div>
                                                <p>${prateleira.titulo}</p>
                                                <p>${prateleira.descricao}</p>
                                            </div>
                                            <button>Adicionar livro</button>
                                        </div>
                                        <div>
                                            <div class="lista-cards">
                                                ${listaLivros}
                                            </div>
                                        </div>
                                     </div>`;
});