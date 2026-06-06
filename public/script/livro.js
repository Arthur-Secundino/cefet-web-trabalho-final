import { livro, avaliacoesDeOutrosUsuarios } from "./dados_livro.js";

const livroEl = document.querySelector("#dados-livro");
livroEl.innerHTML = "";

const listaAvaliacoesEl = document.querySelector("#lista-avaliacoes");
listaAvaliacoesEl.innerHTML = "";

livroEl.innerHTML = `<img src="${livro.capa}" alt="Capa do livro ${livro.titulo}">
                     <div>
                        <h3>${livro.titulo}</h3>
                        <p>${livro.autor}</p>
                        <p>${livro.sinopse}</p>
                        <p>${livro.status}</p>

                        <h3 id="sua-avaliacao">Sua avaliação</h3>
                        <p>${livro.nota_dada}</p>
                        <textarea name="avaliacao" id="comentario-usuario">${livro.comentario}</textarea>
                     </div>`;

/*
<img src="" alt="Imagem de uma estrela preenchida ou vazia">
<img src="" alt="Imagem de uma estrela preenchida ou vazia">
<img src="" alt="Imagem de uma estrela preenchida ou vazia">
<img src="" alt="Imagem de uma estrela preenchida ou vazia">
<img src="" alt="Imagem de uma estrela preenchida ou vazia">
*/

avaliacoesDeOutrosUsuarios.forEach(avaliacao => {
    listaAvaliacoesEl.innerHTML += `<div>
                                        <div class="dados-usuario">
                                            <img src="${avaliacao.usuario.avatar}" alt="Avatar do usuário ${avaliacao.usuario.arroba}" class="avatar-usuario">
                                            <div>
                                                <p>${avaliacao.usuario.nome}</p>
                                                <p>${avaliacao.usuario.arroba}</p>
                                            </div>
                                        </div>
                                        <p>${avaliacao.nota}</p>
                                        <p>${avaliacao.comentario}</p>
                                    </div>`;
});