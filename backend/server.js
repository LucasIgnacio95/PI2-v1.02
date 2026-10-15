const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ",env") });

require("./config/db");

const userRoutes = require("./routes/userRoutes");
const alunoRoutes = require("./routes/alunoRoutes");
const ocorrenciaRoutes = require("./routes/ocorrenciaRoutes");
const rotinaRoutes = require("./routes/rotinaRoutes");
const chatRoutes = require("./routes/chatRoutes");
const avisoRoutes = require("./routes/avisoRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend"), { index: false }));

app.use("/api/users", userRoutes);
app.use("/api/alunos", alunoRoutes);
app.use("/api/ocorrencias", ocorrenciaRoutes);
app.use("/api/rotinas", rotinaRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/avisos", avisoRoutes);
app.use("/api/logs", logRoutes);

// Rotas limpas e encriptadas/obfuscadas para as páginas
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dashboard.html"));
});

app.get("/usuarios", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/listaUsuarios.html"));
});

app.get("/alunos", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/listaAlunos.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/chatAluno.html"));
});

app.get("/avisos", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/listaAvisos.html"));
});

app.get("/logs", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/listaLogs.html"));
});

app.get("/aquicriptografa", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/listaAvisos.html"));
});

app.get("/cadastrar-aluno", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/cadastrarAluno.html"));
});

app.get("/cadastrar-aviso", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/cadastrarAviso.html"));
});

app.get("/cadastrar-usuario", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/cadastrarUsuario.html"));
});

app.get("/editar-aluno", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/editarAluno.html"));
});

app.get("/editar-usuario", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/editarUsuario.html"));
});

app.get("/historico-aluno", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/historicoAluno.html"));
});

app.get("/eventos", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/listaEventos.html"));
});

app.get("/registrar-evento", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/registrarEventos.html"));
});

app.get("/acesso-negado", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/acessoNegado.html"));
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});