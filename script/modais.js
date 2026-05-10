const botaoCriarContaEl = document.querySelector("#botao_criar_conta");
const botaoLoginEl = document.querySelector("#botao_login");

const modalCriarContaEl = document.querySelector("#criar_conta");
const modalLogarEl = document.querySelector("#logar");

const botaoCancelarCadastroEl = document.querySelector("#cancelar_cadastro");
const botaoCancelarLoginEl = document.querySelector("#cancelar_login");

botaoCriarContaEl.addEventListener("click", () => {
    modalCriarContaEl.showModal();
});

botaoLoginEl.addEventListener("click", () => {
    modalLogarEl.showModal();
});

botaoCancelarCadastroEl.addEventListener("click", () => {
    modalCriarContaEl.close();
});

botaoCancelarLoginEl.addEventListener("click", () => {
    modalLogarEl.close();
});