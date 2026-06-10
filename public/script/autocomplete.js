// Autocomplete de livros para qualquer <input data-autocomplete="...">.
// data-autocomplete="navegar"  -> ao clicar numa sugestão, abre a página do livro.
// data-autocomplete="preencher" -> ao clicar, preenche o input com o título.

function montaAutocomplete(input) {
    const acao = input.dataset.autocomplete;

    // Envolve o input num container posicionado e cria o dropdown.
    const wrap = document.createElement("div");
    wrap.className = "ac-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    const dropdown = document.createElement("div");
    dropdown.className = "ac-dropdown";
    dropdown.hidden = true;
    wrap.appendChild(dropdown);

    input.setAttribute("autocomplete", "off");

    let timer = null;
    let ultimaBusca = "";

    function fecha() {
        dropdown.hidden = true;
        dropdown.innerHTML = "";
    }

    function renderiza(livros) {
        if (!livros.length) {
            dropdown.innerHTML = `<div class="ac-vazio">Nenhum livro encontrado</div>`;
            dropdown.hidden = false;
            return;
        }
        dropdown.innerHTML = livros
            .map(
                (l) => `
                <button type="button" class="ac-item" data-id="${l.livroId}" data-titulo="${l.titulo.replace(/"/g, "&quot;")}">
                    <img src="${l.capa}" alt="">
                    <span class="ac-info"><strong>${l.titulo}</strong><small>${l.autor}</small></span>
                </button>`
            )
            .join("");
        dropdown.hidden = false;

        dropdown.querySelectorAll(".ac-item").forEach((item) => {
            item.addEventListener("click", () => {
                if (acao === "navegar") {
                    window.location.href = `/livro/${item.dataset.id}`;
                } else {
                    input.value = item.dataset.titulo;
                    fecha();
                    input.focus();
                }
            });
        });
    }

    input.addEventListener("input", () => {
        const termo = input.value.trim();
        clearTimeout(timer);
        if (termo.length < 2) {
            fecha();
            return;
        }
        dropdown.innerHTML = `<div class="ac-carregando">Buscando…</div>`;
        dropdown.hidden = false;

        timer = setTimeout(async () => {
            if (termo === ultimaBusca) return;
            ultimaBusca = termo;
            try {
                const resp = await fetch(`/busca/api?nome=${encodeURIComponent(termo)}`);
                const livros = await resp.json();
                // Ignora se o usuário já mudou o texto.
                if (input.value.trim() === termo) renderiza(livros);
            } catch {
                fecha();
            }
        }, 350);
    });

    // Fecha ao clicar fora ou apertar Esc.
    document.addEventListener("click", (e) => {
        if (!wrap.contains(e.target)) fecha();
    });
    input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") fecha();
    });
}

document.querySelectorAll("input[data-autocomplete]").forEach(montaAutocomplete);
