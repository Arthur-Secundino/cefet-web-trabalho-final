import { MongoClient, ServerApiVersion } from "mongodb";
import dns from "node:dns";

// Em algumas redes o Node não resolve o registro SRV do Atlas (mongodb+srv).
// Definir DNS_SERVERS no .env (ex.: "8.8.8.8,1.1.1.1") força um DNS público.
// Opt-in: sem a variável, nada muda (Arthur e deploy não são afetados).
if (process.env.DNS_SERVERS) {
    dns.setServers(
        process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean)
    );
}

// Nome do banco usado pelo grupo no cluster Atlas compartilhado.
const NOME_BANCO = "trabalho_web";

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
        // Opções serverApi recomendadas pelo Atlas (Stable API v1).
        const cliente = new MongoClient(process.env.STRING_CONEXAO, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });
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

// Retorna o objeto Db (banco "trabalho_web", compartilhado pelo grupo).
export async function getDb() {
    const cliente = await getClienteMongo();
    return cliente.db(NOME_BANCO);
}
