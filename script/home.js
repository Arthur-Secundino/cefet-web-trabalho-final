import { livrosEmAltaNaComunidade, prateleirasPraSeInsipirar, reviewsRecentes } from "./dados_home.js";

const listaLivrosEmAltaEl = document.querySelector("#livros_em_alta");
listaLivrosEmAltaEl.innerHTML = "";

const listaPrateleirasEmAltaEl = document.querySelector("#prateleiras_em_alta");
listaPrateleirasEmAltaEl.innerHTML = "";

const listaReviewsRecentesEl = document.querySelector("#reviews_recentes");
listaReviewsRecentesEl.innerHTML = "";

livrosEmAltaNaComunidade.forEach(livro => {
    listaLivrosEmAltaEl.innerHTML += `<article class="card">
                                        <img src="${livro.capa}" alt="Capa do livro ${livro.titulo}">
                                        <p>${livro.titulo}</p>
                                        <p>${livro.descricao}</p>
                                      </article>`
});

prateleirasPraSeInsipirar.forEach(prateleira => {
    listaPrateleirasEmAltaEl.innerHTML += `<article class="card">
                                             <img src="${prateleira.imagem}" alt="Imagem representativa da prateleira ${prateleira.nome}">
                                             <p>${prateleira.nome}</p>
                                             <p>${prateleira.descricao}</p>
                                           </article>`
});

reviewsRecentes.forEach(review => {
    listaReviewsRecentesEl.innerHTML += `<article class="review card">
                                            <h4 class="titulo">${review.titulo}</h4>
                                            <article class="card card-interno">
                                                <img src="${review.livro.capa}" alt="Capa do livro ${review.livro.titulo}">
                                                <p>${review.livro.titulo}</p>
                                                <p>${review.livro.nota}</p>
                                            </article>
                                            <div class="dados-usuario">
                                                <img src="${review.usuario.avatar}" alt="Avatar do usuário ${review.usuario.arroba}" class="avatar-usuario">
                                                <div>
                                                    <p>${review.usuario.nome}</p>
                                                    <p>${review.usuario.arroba}</p>
                                                </div>
                                            </div>
                                            <p>${review.review}</p>
                                         </article>`
});