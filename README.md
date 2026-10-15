# 📚 Prontuário Escolar Web

Sistema web desenvolvido como projeto acadêmico com o objetivo de facilitar a comunicação entre escola e responsáveis, além de organizar informações dos alunos.

---

## 🎯 Objetivo

Desenvolver um sistema web utilizando:

* Backend com Node.js
* Banco de dados MariaDB
* Frontend com HTML, CSS e JavaScript
* Controle de versão com Git/GitHub

---

## 👥 Perfis de Usuário

### 👨‍💼 Admin

* Criar, editar e excluir:

  * Professores
  * Responsáveis
  * Alunos
* Controle total do sistema

---

### 👨‍🏫 Professor

* Gerenciar alunos
* Registrar:

  * Ocorrências
  * Rotina
  * Observações
* Responder mensagens dos responsáveis

---

### 👨‍👩‍👧 Responsável (Pai/Mãe)

* Visualizar informações do filho
* Acompanhar:

  * Ocorrências
  * Rotina
* Enviar mensagens para o professor

---

## 🧱 Estrutura do Projeto

```
prontuario-escolar/
│
├── backend/
│   ├── config/
│   ├── routes/
│   ├── server.js
│   └── .env
│
└── frontend/
    ├── index.html
    ├── dashboard.html
    ├── script.js
    └── style.css
```

---

## ⚙️ Tecnologias Utilizadas

* Node.js
* Express
* MariaDB
* HTML
* CSS
* JavaScript
* Git e GitHub

---

## 🚀 Como Executar o Projeto

---

# 💻 🔵 LINUX (Toolbox / Fedora / Ubuntu)

## 1. Clonar o projeto

```bash
git clone https://github.com/Renan-Damalio/Pi1.git
cd Pi1
```

---

## 2. Instalar dependências

```bash
cd backend
npm install
```

---

## 3. Iniciar o banco de dados

```bash
mysqld --datadir=$HOME/mysql-data \
--socket=$HOME/mysql-data/mysql.sock \
--pid-file=$HOME/mysql-data/mysql.pid \
--skip-networking
```

⚠️ Deixe esse terminal aberto

---

## 4. Iniciar o backend

Em outro terminal:

```bash
cd backend
node server.js
```

---

## 5. Iniciar o frontend

Em outro terminal:

```bash
cd frontend
python3 -m http.server 5500
```

---

## 6. Acessar no navegador

```
http://localhost:5500
```

---

# 🪟 🟢 WINDOWS

## 1. Clonar o projeto

```bash
git clone https://github.com/Renan-Damalio/Pi1.git
cd Pi1
```

---

## 2. Instalar dependências

```bash
cd backend
npm install
```

---

## 3. Instalar e iniciar MariaDB

* Instale o MariaDB no Windows
* Inicie o serviço normalmente

---

## 4. Configurar conexão

No arquivo `config/db.js`, use:

```js
host: "localhost",
user: "root",
password: "",
database: "prontuario_escolar"
```

---

## 5. Rodar backend

```bash
node server.js
```

---

## 6. Rodar frontend

```bash
cd frontend
npx serve
```

OU abrir com Live Server (VS Code)

---

## 7. Acessar

```
http://localhost:3000 (API)
http://localhost:5500 (Frontend)
```

---

## 🗄️ Banco de Dados

1. Abra o painel de controle do XAMPP.

2. Na linha do Apache, clique no botão Start.

3 . Na linha do MySQL, clique no botão Start. (Isso garante que o seu servidor local e o banco de dados estejam rodando para receber as informações).

### Criar banco:

```sql
CREATE DATABASE prontuario_escolar;
USE prontuario_escolar;
```

---

### Criar tabelas

-- Tabela de Usuários
```sql
CREATE TABLE usuarios (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    senha VARCHAR(100) NOT NULL
);
```

-- Tabela de Alunos
```sql
CREATE TABLE alunos (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE NOT NULL,
    turma VARCHAR(50) NOT NULL,
    responsavel VARCHAR(100) NOT NULL,
    responsavel_id INT(11) NOT NULL
);
```

-- Tabela de Mensagens (Chat)
```sql
CREATE TABLE mensagens (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT(11) NOT NULL,
    mensagem VARCHAR(1000) NOT NULL,
    aluno_id INT(11) NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id)
);
```

-- Tabela de Avisos
```sql
CREATE TABLE avisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(100),
    data_evento DATE NULL,
    turma VARCHAR(100),
    autor_nome VARCHAR(255)
);
```

-- Tabela de Logs de Auditoria
```sql
CREATE TABLE logs_auditoria (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT(11) NOT NULL,
    acao VARCHAR(100) NOT NULL,
    registro_afetado VARCHAR(100),
    detalhes TEXT,
    ip VARCHAR(50),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

-- Trigger de Auditoria
```sql
DELIMITER //
CREATE TRIGGER trg_log_alunos_after_insert
AFTER INSERT ON alunos
FOR EACH ROW
BEGIN
    INSERT INTO logs_auditoria (usuario_id, acao, registro_afetado, detalhes, ip)
    VALUES (NEW.responsavel_id, 'INSERÇÃO DE ALUNO', CONCAT('Aluno ID: ', NEW.id), CONCAT('Nome: ', NEW.nome), '127.0.0.1');
END;
//
DELIMITER ;
```
### Inserir dados iniciais:

```sql
INSERT INTO usuarios (nome,email,senha,tipo) VALUES
('Admin','admin@email.com','123','admin'),
('Professor João','prof@email.com','123','professor'),
('Pai Maria','pai@email.com','123','responsavel');

INSERT INTO alunos (nome,data_nascimento,turma) VALUES
('Aluno Teste','2020-01-01','Berçário 2');
```

---

## 🔐 Login padrão

```
Email: admin@email.com
Senha: 123
```

---

## 📌 Funcionalidades (v1.0.2)

* Login de usuários com autenticação baseada em tokens
* Consentimento e aceite explícito prévio dos responsáveis legais antes da coleta de dados de menores
* Criptografia de dados em trânsito e em repouso (segurança e conformidade LGPD)
* Validação rigorosa de criação de senhas fortes
* Sistema de registo de auditoria (logs) de atividades
* Cadastro de alunos e responsáveis
* Registro de ocorrências e rotina
* Sistema de chat integrado
* Controle de usuários (admin)

---

## ⚠️ Observações

* Não subir:

  * node_modules
  * .env
  * mysql-data

* Utilizar `.gitignore`

---

## 📈 Próximas melhorias

* Interface com abas (estilo navegador)
* Controle de permissões por usuário
* Dashboard personalizado
* Melhorias visuais (UI/UX)

---

## 👨‍💻 Autor

Projeto desenvolvido para a disciplina:

**PJI110 - Projeto Integrador em Computação I**

---

## 📄 Licença

Este projeto é acadêmico e de uso educacional.
