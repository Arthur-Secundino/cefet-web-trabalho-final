import { dadosIniciaisUsuario, estatisticasUsuario } from "./dados_perfil.js";

const dadosIniciaisPerfilEl = document.querySelector("#dados_iniciais_perfil");
dadosIniciaisPerfilEl.innerHTML = `<div>
                                     <h1>${dadosIniciaisUsuario.nome}</h1>
                                     <p>Membro desde ${dadosIniciaisUsuario.anoDeIngresso}</p>
                                     <p>${dadosIniciaisUsuario.textoExplicativo}</p>
                                   </div>
                                   <img src="${dadosIniciaisUsuario.avatar}" alt="Avatar do usuário ${dadosIniciaisUsuario.arroba}">`;

const estatisticasUsuarioEl = document.querySelector("#estatisticas_usuario");
estatisticasUsuarioEl.innerHTML = `<img src="${estatisticasUsuario.grafico}" alt="Gráfico de pizza dos gêneros mais lidos pelo usuário ${dadosIniciaisUsuario.arroba}">
                                   <div>
                                        <p>Livros lidos: ${estatisticasUsuario.quantidadeLivrosLidos}</p>
                                        <p>Nota média: ${estatisticasUsuario.notaMedia}</p>

                                        <p>Livro mais recente: ${estatisticasUsuario.livroMaisRecenteLido}</p>

                                        <p>Prateleiras públicas:</p>
                                        <ul>
                                            <li>${estatisticasUsuario.prateleirasPublicas[0]}</li>
                                            <li>${estatisticasUsuario.prateleirasPublicas[1]}</li>
                                        </ul>
                    
                                        <p>Livro mais recente avaliado: ${estatisticasUsuario.livroMaisRecenteAvaliado}</p>
                                   </div>`;