const express = require("express");
const router = express.Router();
const db = require("../config/db");
const registrarLog = require("../utils/logger");

router.post("/", (req, res) => {
  const { titulo, descricao, tipo, data_evento, turma, autor_nome } = req.body;

  // Log para você ver no terminal do VSCode o que está chegando
  console.log("Recebido do frontend:", { titulo, descricao, tipo, data_evento, turma, autor_nome });

  db.query(
    "INSERT INTO avisos (titulo, descricao, tipo, data_evento, turma, autor_nome) VALUES (?,?,?,?,?,?)",
    [titulo, descricao, tipo, data_evento, turma, autor_nome],
    (err, result) => {
      if (err) {
        // Isso vai imprimir o erro EXATO no terminal onde o servidor está rodando
        console.error("Erro do MySQL:", err); 
        
        // Devolvemos a mensagem de erro formatada para o navegador
        return res.status(500).json({ message: "Erro no banco: " + err.message });
      }

      const ipUsuario = req.ip || req.connection.remoteAddress;
      registrarLog(1, "CRIOU_AVISO", `Aviso #${result.insertId}`, `Criado aviso "${titulo}" (${tipo})`, ipUsuario);

      res.json({ message: "Aviso criado com sucesso!" });
    }
  );
});

router.get("/", (req, res) => {
  db.query("SELECT * FROM avisos", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// BUSCAR UM ÚNICO Aviso PELO ID
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM avisos WHERE id = ?", 
    [req.params.id], 
    (err, result) => {
      if (err) return res.status(500).json(err);
      
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).json({ message: "Aviso não encontrado" });
      }
    }
  );
});

router.put("/:id", (req, res) => {
  const { titulo, descricao, tipo, data_evento, turma, autor_nome } = req.body;

  db.query(
    "UPDATE avisos SET titulo=?,descricao=?,tipo=?, data_evento=?, turma=?, autor_nome=? WHERE id=?",
    [titulo, descricao, tipo, data_evento, turma, autor_nome, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);

      const ipUsuario = req.ip || req.connection.remoteAddress;
      registrarLog(1, "EDITOU_AVISO", `Aviso #${req.params.id}`, `Editado aviso "${titulo}"`, ipUsuario);

      res.json({ message: "Atualizado" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM avisos WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    const ipUsuario = req.ip || req.connection.remoteAddress;
    registrarLog(1, "EXCLUIU_AVISO", `Aviso #${req.params.id}`, `Excluído aviso #${req.params.id}`, ipUsuario);

    res.json({ message: "Excluído" });
  });
});

module.exports = router;