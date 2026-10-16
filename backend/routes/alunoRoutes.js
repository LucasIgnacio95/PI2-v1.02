

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const registrarLog = require("../utils/logger");

router.post("/", (req, res) => {
    const { nome, data_nascimento, turma, responsavel, responsavel_id, consentimento_parental } = req.body;

    console.log("Recebido do frontend:", { nome, data_nascimento, turma, responsavel, responsavel_id, consentimento_parental });

    if (!consentimento_parental) {
        return res.status(400).json({
            message: "Consentimento parental explícito é obrigatório para a coleta de dados da criança (LGPD)."
        });
    }

    db.query(
        "INSERT INTO alunos (nome, data_nascimento, turma, responsavel, responsavel_id, consentimento_parental, data_consentimento) VALUES (?,?,?,?,?, 1, NOW())",
        [nome, data_nascimento, turma, responsavel, responsavel_id],
        (err, result) => {
            if (err) {

                console.error("Erro do MySQL:", err);


                return res.status(500).json({ message: "Erro no banco: " + err.message });
            }

            const ipUsuario = req.ip || req.connection.remoteAddress;
            registrarLog(1, "CRIOU_ALUNO", `Aluno #${result.insertId}`, `Criado aluno ${nome} (${turma})`, ipUsuario);

            res.json({ message: "Aluno criado com sucesso com consentimento parental registrado!" });
        }
    );
});

router.get("/", (req, res) => {
    db.query("SELECT * FROM alunos", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// BUSCAR UM ÚNICO ALUNO PELO ID
router.get("/:id", (req, res) => {
    db.query(
        "SELECT * FROM alunos WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json(err);

            if (result.length > 0) {
                res.json(result[0]);
            } else {
                res.status(404).json({ message: "Aluno não encontrado" });
            }
        }
    );
});

router.put("/:id", (req, res) => {
    const { nome, data_nascimento, turma, responsavel, responsavel_id, consentimento_parental } = req.body;

    let query = "UPDATE alunos SET nome=?, data_nascimento=?, turma=?, responsavel=?, responsavel_id=?";
    let params = [nome, data_nascimento, turma, responsavel, responsavel_id];

    if (consentimento_parental) {
        query += ", consentimento_parental=1, data_consentimento=COALESCE(data_consentimento, NOW())";
    }

    query += " WHERE id=?";
    params.push(req.params.id);

    db.query(query, params, (err) => {
        if (err) return res.status(500).json(err);

        const ipUsuario = req.ip || req.connection.remoteAddress;
        registrarLog(1, "EDITOU_ALUNO", `Aluno #${req.params.id}`, `Editado aluno ${nome}`, ipUsuario);

        res.json({ message: "Atualizado com sucesso!" });
    });
});

router.delete("/:id", (req, res) => {
    db.query("DELETE FROM alunos WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);

        const ipUsuario = req.ip || req.connection.remoteAddress;
        registrarLog(1, "EXCLUIU_ALUNO", `Aluno #${req.params.id}`, `Excluído aluno #${req.params.id}`, ipUsuario);

        res.json({ message: "Excluído" });
    });
});

module.exports = router;