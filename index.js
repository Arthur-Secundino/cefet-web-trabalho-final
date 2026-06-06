import express from "express";
import hbs from "hbs";
import http from "http";

const PORTA = 3000;

const app = express();
app.set("port", PORTA);

app.use(express.static("public"));

app.set("views", "./views");
app.set("view engine", "hbs");

const servidor = http.createServer(app);
servidor.listen(PORTA, "localhost");