import { ObjectId } from "mongodb";
import conectarAoBanco from "../config/dbConfig.js";

const conexao = await conectarAoBanco();

export async function getPrateleiras(){

}

export async function criaNovaPrateleira(novaPrateleira){

}

export async function getDadosLivro(idLivro, nomeLivro){

}

export async function insereLivroNaPrateleira(idPrateleira, novoLivro){

}

export async function avaliaLivro(idLivro, avaliacao){

}

export async function getDadosUsuario(idUsuario){

}

export async function busca(nome, filtros){
    
}