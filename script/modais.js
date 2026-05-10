const botaoCriarContaEl = document.querySelector("#botao_criar_conta");
const botaoLoginEl = document.querySelector("#botao_login");

const modalCriarContaEl = document.querySelector("#criar_conta");
const modalLogarEl = document.querySelector("#logar");

const botaoEnviarDadosCadastroEl = document.querySelector("#enviar_dados_cadastro");
const botaoEnviarDadosLoginEl = document.querySelector("#enviar_dados_login");

const botaoCancelarCadastroEl = document.querySelector("#cancelar_cadastro");
const botaoCancelarLoginEl = document.querySelector("#cancelar_login");

const inputNomeUsuarioCadastroEl = document.querySelector("#nome_usuario_cadastro");
const inputEmailCadastroEl = document.querySelector("#email_cadastro");
const inputSenhaCadastroEl = document.querySelector("#senha_cadastro");

const inputEmailLoginEl = document.querySelector("#email_login");
const inputSenhaLoginEl = document.querySelector("#senha_login");

botaoCriarContaEl.addEventListener("click", () => {
    modalCriarContaEl.showModal();
});

botaoLoginEl.addEventListener("click", () => {
    modalLogarEl.showModal();
});

botaoEnviarDadosCadastroEl.addEventListener("click", () => {
//    if(inputNomeUsuarioCadastroEl.value !== "" && inputEmailCadastroEl.value !== "" && inputSenhaCadastroEl.value !== ""){
        window.location.href = "./pages/home.html";
//    }
});

botaoEnviarDadosLoginEl.addEventListener("click", () => {
//    if(inputEmailLoginEl.value !== "" && inputSenhaLoginEl.value !== ""){
        window.location.href = "./pages/home.html";
//    }
});

botaoCancelarCadastroEl.addEventListener("click", () => {
    modalCriarContaEl.close();
});

botaoCancelarLoginEl.addEventListener("click", () => {
    modalLogarEl.close();
});