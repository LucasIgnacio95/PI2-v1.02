const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Listar todos os logs de auditoria
router.get("/", (req, res) => {
    db.query(
        `SELECT l.*, u.usuario as nome_usuario, u.email as email_usuario, u.tipo as tipo_usuario 
         FROM logs_auditoria l 
         LEFT JOIN usuarios u ON l.usuario_id = u.id 
         ORDER BY l.data_hora DESC`,
        (err, result) => {
            if (err) {
                console.error("Erro ao buscar logs de auditoria:", err);
                return res.status(500).json({ message: "Erro ao buscar logs: " + err.message });
            }
            res.json(result);
        }
    );
});

module.exports = router;
