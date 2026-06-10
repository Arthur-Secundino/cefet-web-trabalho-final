import { MongoClient } from "mongodb";

// Conexão preguiçosa (lazy): só abre o cliente na primeira query, e reaproveita
// a mesma promessa nas chamadas seguintes. Assim o servidor sobe mesmo sem o
// banco configurado (a landing e os arquivos estáticos continuam funcionando).
let clientePromessa = null;

function getClienteMongo() {
    if (!process.env.STRING_CONEXAO) {
        throw new Error(
            "STRING_CONEXAO não definida. Copie .env.example para .env e preencha a URI do MongoDB."
        );
    }

    if (!clientePromessa) {
        const cliente = new MongoClient(process.env.STRING_CONEXAO);
        console.log("Conectando ao cluster do banco de dados...");
        clientePromessa = cliente
            .connect()
            .then((conectado) => {
                console.log("Conectado ao MongoDB Atlas com sucesso!");
                return conectado;
            })
            .catch((erro) => {
                clientePromessa = null; // permite nova tentativa numa próxima query
                throw erro;
            });
    }

    return clientePromessa;
}

// Retorna o objeto Db (o nome do banco vem embutido na STRING_CONEXAO).
export async function getDb() {
    const cliente = await getClienteMongo();
    return cliente.db();
}
