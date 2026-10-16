const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/", (req, res) => {
  const { aluno_id, remetente_id, mensagem } = req.body;

  db.query(
    "INSERT INTO mensagens (aluno_id,remetente_id,mensagem) VALUES (?,?,?)",
    [aluno_id, remetente_id, mensagem],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Mensagem enviada" });
    }
  );
});

router.get("/:aluno_id", (req, res) => {
  db.query(
    `SELECT m.*, u.nome AS remetente_nome 
     FROM mensagens m 
     JOIN usuarios u ON m.remetente_id=u.id 
     WHERE aluno_id=?`,
    [req.params.aluno_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

module.exports = router;