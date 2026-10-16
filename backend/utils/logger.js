
const db = require("../config/db");

function registrarLog(usuarioId, acao, registroAfetado, detalhes, ip) {
    const query = `
    INSERT INTO logs_auditoria (usuario_id, acao, registro_afetado, detalhes, ip) 
    VALUES (?, ?, ?, ?, ?)
  `;

    db.query(query, [usuarioId || 1, acao, registroAfetado, detalhes, ip || "127.0.0.1"], (err) => {
        if (err) {
            console.error("Erro ao registrar auditoria:", err);
        }
    });
}

module.exports = registrarLog;