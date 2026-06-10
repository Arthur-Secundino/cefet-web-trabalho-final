// Controla a abertura/fechamento dos modais de login e cadastro na landing.
// O envio dos dados é feito pelos próprios <form> (POST /login e POST /cadastro).

const botaoCriarConta = document.querySelector("#botao_criar_conta");
const botaoLogin = document.querySelector("#botao_login");
const botaoHeroCriar = document.querySelector("#botao-criar-prateleira");

const modalCriarConta = document.querySelector("#criar_conta");
const modalLogar = document.querySelector("#logar");

const cancelarCadastro = document.querySelector("#cancelar_cadastro");
const cancelarLogin = document.querySelector("#cancelar_login");

botaoCriarConta?.addEventListener("click", () => modalCriarConta.showModal());
botaoHeroCriar?.addEventListener("click", () => modalCriarConta.showModal());
botaoLogin?.addEventListener("click", () => modalLogar.showModal());

cancelarCadastro?.addEventListener("click", () => modalCriarConta.close());
cancelarLogin?.addEventListener("click", () => modalLogar.close());
