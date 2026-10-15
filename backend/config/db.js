const mysql = require("mysql2");

const dbConfig = {
  host: process.env.DB_HOST || "prontuario-db.c9o4qccowy1b.us-east-2.rds.amazonaws.com",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "prontuario_escolar",

  authSwitchHandler: ({ pluginName, data }, cb) => {
    if (pluginName === 'auth_gssapi_client') {
      return cb(null, Buffer.alloc(0));
    }
    cb(new Error(`Plugin de autenticação desconhecido: ${pluginName}`));
  }
};





if (dbConfig.host.includes("rds.amazonaws.com") || process.env.DB_SSL === "true") {
  dbConfig.ssl = { rejectUnauthorized: false };
}

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar:", err);
  } else {
    console.log("Conectado ao banco MariaDB!");
    // Verificar e adicionar colunas de consentimento parental se não existirem
    connection.query(`
      ALTER TABLE alunos 
      ADD COLUMN IF NOT EXISTS consentimento_parental TINYINT(1) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS data_consentimento DATETIME NULL;
    `, (alterErr) => {
      if (alterErr) {
        console.log("Nota sobre colunas de consentimento (podem já existir):", alterErr.message);
      } else {
        console.log("Suporte a consentimento parental verificado/atualizado na tabela alunos.");
      }
    });

    connection.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS usuario VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS consentimento_lgpd TINYINT(1) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS data_consentimento_lgpd DATETIME NULL,
      ADD COLUMN IF NOT EXISTS token VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS codigo_2fa VARCHAR(6) NULL,
      ADD COLUMN IF NOT EXISTS expiracao_2fa DATETIME NULL;
    `, (alterErrUsuarios) => {
      if (alterErrUsuarios) {
        console.log("Nota sobre colunas de consentimento LGPD em usuários (podem já existir):", alterErrUsuarios.message);
      } else {
        console.log("Suporte a consentimento LGPD verificado/atualizado na tabela usuarios.");
      }
    });

    // Criar tabela de avisos se não existir
    connection.query(`
      CREATE TABLE IF NOT EXISTS avisos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          titulo VARCHAR(255) NOT NULL,
          descricao TEXT,
          tipo VARCHAR(100),
          data_evento DATE NULL,
          turma VARCHAR(100),
          autor_nome VARCHAR(255)
      );
    `, (avisosTableErr) => {
      if (avisosTableErr) {
        console.log("Nota sobre tabela avisos:", avisosTableErr.message);
      } else {
        console.log("Tabela avisos verificada/criada com sucesso.");
      }
    });

    // Criar tabela de logs de auditoria se não existir
    connection.query(`
      CREATE TABLE IF NOT EXISTS logs_auditoria (
          id INT AUTO_INCREMENT PRIMARY KEY,
          data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
          usuario_id INT NOT NULL,
          acao VARCHAR(50) NOT NULL,
          registro_afetado VARCHAR(100),
          detalhes TEXT,
          ip VARCHAR(45)
      );
    `, (logTableErr) => {
      if (logTableErr) {
        console.log("Nota sobre tabela logs_auditoria:", logTableErr.message);
      } else {
        console.log("Tabela logs_auditoria verificada/criada com sucesso.");
      }
    });

  }
});

module.exports = connection;
