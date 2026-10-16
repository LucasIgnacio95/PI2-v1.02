# 📚 Prontuário Escolar Web (v1.0.2)

Sistema web desenvolvido como projeto acadêmico com o objetivo de facilitar a comunicação entre escola e responsáveis, além de organizar informações dos alunos.

---

## 🌐 Acesso ao Sistema (Produção - AWS)

O projeto está hospedado em uma instância **Amazon EC2 (Amazon Linux 2023)** na AWS, utilizando banco de dados **AWS Amazon Aurora / RDS**.

* **URL de Acesso:** [http://18.118.254.136:3000/](http://18.118.254.136:3000/)
* **Repositório GitHub:** [https://github.com/LucasIgnacio95/PI2-v1.02](https://github.com/LucasIgnacio95/PI2-v1.02)

---

## 🎯 Objetivo

Desenvolver um sistema web utilizando:

* Backend com Node.js e Express
* Banco de dados AWS Amazon Aurora / RDS
* Frontend com HTML, CSS e JavaScript
* Infraestrutura em nuvem AWS (EC2 Instance Connect)
* Controle de versão com Git/GitHub

---

## 👥 Perfis de Usuário

### 👨‍💼 Admin
* Criar, editar e excluir:
  * Professores
  * Responsáveis
  * Alunos
* Controle total do sistema

### 👨‍🏫 Professor
* Gerenciar alunos (cadastro de alunos)
* Publicar e gerenciar avisos escolares
* Responder mensagens dos responsáveis via chat integrado

### 👨‍👩‍👧 Responsável (Pai/Mãe)
* Visualizar informações do filho
* Acompanhar avisos da escola
* Enviar e receber mensagens do professor pelo chat integrado

---

## 🧱 Estrutura do Projeto

```
PI2-v1.02/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
└── frontend/
    ├── acessonNegado.html
    ├── cadastrarAluno.html
    ├── cadastrarAviso.html
    ├── cadastrarUsuario.html
    ├── chatAluno.html
    ├── dashboard.html
    ├── editarAluno.html
    ├── editarUsuario.html
    ├── historicoAluno.html
    ├── index.html
    ├── listaAlunos.html
    ├── listaAvisos.html
    ├── listaEventos.html
    ├── listaLogs.html
    ├── listaUsuarios.html
    ├── registrarEventos.html
    ├── script.js
    └── style.css
```

---

## ⚙️ Tecnologias Utilizadas

* Node.js / Express
* AWS Amazon Aurora & RDS (MySQL/MariaDB Compatible)
* AWS EC2 (Amazon Linux 2023)
* HTML5, CSS3, JavaScript
* Git e GitHub

---

## 🚀 Como Clonar e Executar

### 1. Clonar o projeto
```bash
git clone https://github.com/LucasIgnacio95/PI2-v1.02.git
cd PI2-v1.02
```

### 2. Instalar dependências (Backend)
```bash
cd backend
npm install
```

### 3. Configuração do Banco de Dados (AWS RDS / Aurora)
Configure as credenciais de conexão com o banco AWS Aurora/RDS no arquivo de configuração do backend ou via variáveis de ambiente (`.env`).

### 4. Iniciar o Servidor
```bash
node server.js
```

---

## 🗄️ Estrutura do Banco de Dados (AWS Amazon Aurora / RDS)

Para configurar o banco de dados relacional na AWS (compatível com MySQL/MariaDB), utilize os comandos SQL abaixo:

### 1. Criar Banco de Dados:
```sql
CREATE DATABASE prontuario_escolar;
USE prontuario_escolar;
```

### 2. Criar Tabelas:

-- Tabela de Usuários (com suporte a LGPD, tokens, 2FA e nome de usuário)
```sql
CREATE TABLE usuarios (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    consentimento_lgpd TINYINT(1) DEFAULT 0,
    data_consentimento_lgpd DATETIME DEFAULT NULL,
    token TEXT DEFAULT NULL,
    codigo_2fa VARCHAR(10) DEFAULT NULL,
    expiracao_2fa DATETIME DEFAULT NULL,
    usuario VARCHAR(100) DEFAULT NULL
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

### 3. Inserir Dados Iniciais:
```sql
INSERT INTO usuarios (nome, email, tipo, senha, consentimento_lgpd, usuario) VALUES
('Admin', 'admin@email.com', 'admin', '123', 0, 'admin'),
('Professor João', 'joao@email.com', 'Professor', '123', 0, 'profjoao'),
('Pai Maria', 'caio@email.com', 'Responsável', '123', 0, 'caio');

INSERT INTO alunos (nome, data_nascimento, turma, responsavel, responsavel_id) VALUES
('Aluno Teste', '2020-01-01', 'Berçário 2', 'Pai Maria', 5);
```

---

## 🔐 Login Padrão

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
* **Cadastro de alunos**
* **Sistema de avisos escolares**
* **Sistema de chat integrado**
* Controle de usuários (admin)

---

## 👨‍💻 Autor

Projeto desenvolvido para a disciplina:

**PJI110 - Projeto Integrador em Computação I**

---

## 📄 Licença

Este projeto é acadêmico e de uso educacional.
