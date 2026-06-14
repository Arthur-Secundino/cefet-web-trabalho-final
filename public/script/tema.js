// Modo escuro: aplica o tema salvo (localStorage) e cria um botão flutuante
// para alternar. Roda no <head> para não "piscar" na cor errada ao carregar.
(function () {
    const salvo = localStorage.getItem("tema");
    if (salvo) document.documentElement.dataset.tema = salvo;

    function atualizaIcone(tema) {
        const b = document.querySelector("#botao-tema");
        if (b) b.textContent = tema === "escuro" ? "☀" : "☾";
    }

    function alterna() {
        const novo = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
        document.documentElement.dataset.tema = novo;
        localStorage.setItem("tema", novo);
        atualizaIcone(novo);
    }

    document.addEventListener("DOMContentLoaded", () => {
        const botao = document.createElement("button");
        botao.id = "botao-tema";
        botao.type = "button";
        botao.title = "Alternar tema claro/escuro";
        botao.setAttribute("aria-label", "Alternar tema claro/escuro");
        botao.addEventListener("click", alterna);
        document.body.appendChild(botao);
        atualizaIcone(document.documentElement.dataset.tema || "claro");
    });
})();