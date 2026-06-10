import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

export default async function conectarAoBanco(){
    dotenv.config();
    let mongoClient;

    try{
        mongoClient = new MongoClient(process.env.STRING_CONEXAO, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        });
        console.log("Conectando ao cluster do banco de dados...");
        await mongoClient.connect();
        console.log("Testando conexão");
        await mongoClient.db("trabalho_web").command({ ping: 1 });
        console.log("Conectado ao MongoDB Atlas com sucesso!");

        return mongoClient;
    } catch (erro){
        console.error("Falha na conexão com o banco!", erro);
        process.exit();
    }
}