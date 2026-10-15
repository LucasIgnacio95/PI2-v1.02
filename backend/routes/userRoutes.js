
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const crypto = require("crypto");
const registrarLog = require("../utils/logger");
const { enviarEmail2FA, enviarEmailBoasVindas, removerIdentidadeSES } = require("../utils/sesService");

// Função auxilar para hash SHA-256
function hashSenha(senha) {
    return crypto.createHash("sha256").update(senha).digest("hex");
}

// LOGIN - Passo 1: Valida credenciais (por usuário) e restringe 2FA apenas a administradores
router.post("/login", (req, res) => {
    const { usuario, senha } = req.body;
    const senhaHash = hashSenha(senha);

    db.query(
        "SELECT * FROM usuarios WHERE (usuario = ? OR nome = ?) AND (senha = ? OR senha = ?)",
        [usuario, usuario, senhaHash, senha],
        async (err, result) => {
            if (err) return res.status(500).json(err);

            if (result.length > 0) {
                const user = result[0];

                // Se a senha estava em texto plano, atualiza para o hash automaticamente
                if (user.senha === senha) {
                    db.query("UPDATE usuarios SET senha = ? WHERE id = ?", [senhaHash, user.id]);
                }

                const tipoUsuario = user.tipo ? user.tipo.toLowerCase() : "";
                const isAdmin = tipoUsuario === "admin" || tipoUsuario === "administrador";

                if (isAdmin) {
                    // Gerar código 2FA de 6 dígitos e expiração em 5 minutos
                    const codigo2fa = Math.floor(100000 + Math.random() * 900000).toString();
                    const expiracao2fa = new Date(Date.now() + 5 * 60 * 1000);

                    db.query(
                        "UPDATE usuarios SET codigo_2fa = ?, expiracao_2fa = ? WHERE id = ?",
                        [codigo2fa, expiracao2fa, user.id],
                        async (updateErr) => {
                            if (updateErr) return res.status(500).json(updateErr);

                            // Enviar e-mail com o código 2FA via Amazon SES (se e-mail cadastrado)
                            if (user.email) {
                                await enviarEmail2FA(user.email, codigo2fa);
                            }

                            res.json({
                                exige2FA: true,
                                email: user.email || "administrador@sistema.com",
                                message: "Código de verificação de 2 fatores enviado para o e-mail."
                            });
                        }
                    );
                } else {
                    // Não é admin: login direto sem 2FA
                    const token = crypto.randomBytes(32).toString("hex");

                    db.query(
                        "UPDATE usuarios SET token = ?, codigo_2fa = NULL, expiracao_2fa = NULL WHERE id = ?",
                        [token, user.id],
                        (updateErr) => {
                            if (updateErr) return res.status(500).json(updateErr);

                            user.token = token;
                            delete user.senha;
                            delete user.codigo_2fa;
                            delete user.expiracao_2fa;

                            // Registrar Log de Auditoria
                            const ipUsuario = req.ip || req.connection.remoteAddress;
                            registrarLog(user.id, "LOGIN", `Usuário #${user.id}`, "Login realizado com sucesso (sem 2FA)", ipUsuario);

                            res.json({ message: "Login realizado com sucesso", token, user });
                        }
                    );
                }
            } else {
                res.status(401).json({ message: "Usuário ou senha incorretos." });
            }
        }
    );
});

// VERIFICAR 2FA - Passo 2: Valida o código OTP e emite o token de acesso
router.post("/verificar-2fa", (req, res) => {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
        return res.status(400).json({ message: "E-mail e código são obrigatórios." });
    }

    db.query(
        "SELECT * FROM usuarios WHERE email = ? AND codigo_2fa = ? AND expiracao_2fa > NOW()",
        [email, codigo],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Erro no servidor ao verificar 2FA." });

            if (results.length === 0) {
                return res.status(401).json({ message: "Código de verificação inválido ou expirado." });
            }

            const user = results[0];
            const token = crypto.randomBytes(32).toString("hex");

            // Atualiza token e limpa os campos 2FA
            db.query(
                "UPDATE usuarios SET token = ?, codigo_2fa = NULL, expiracao_2fa = NULL WHERE id = ?",
                [token, user.id],
                (updateErr) => {
                    if (updateErr) return res.status(500).json(updateErr);

                    user.token = token;
                    delete user.senha;
                    delete user.codigo_2fa;
                    delete user.expiracao_2fa;

                    // Registrar Log de Auditoria
                    const ipUsuario = req.ip || req.connection.remoteAddress;
                    registrarLog(user.id, "LOGIN_2FA", `Usuário #${user.id}`, "Login com 2FA realizado com sucesso", ipUsuario);

                    res.json({ message: "Login realizado com sucesso", token, user });
                }
            );
        }
    );
});


const SENHAS_COMUNS = ["12345678", "123456789", "password", "senha123", "admin123", "123456", "qwertyui", "mudar123", "senha", "abcdefgh"];

function validarSenhaForte(senha) {
    if (!senha || senha.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
    if (!/[A-Z]/.test(senha)) return "A senha deve conter pelo menos uma letra maiúscula.";
    if (!/[a-z]/.test(senha)) return "A senha deve conter pelo menos uma letra minúscula.";
    if (!/[0-9]/.test(senha)) return "A senha deve conter pelo menos um número.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) return "A senha deve conter pelo menos um caractere especial (!@#$%^&*).";
    if (SENHAS_COMUNS.includes(senha.toLowerCase())) return "Esta senha é muito comum ou fraca. Escolha outra.";
    return null;
}

// CRUD USUÁRIOS (ADMIN)
router.post("/", (req, res) => {
    const { usuario, nome, email, senha, tipo } = req.body;
    const userLogin = usuario || nome;

    const erroSenha = validarSenhaForte(senha);
    if (erroSenha) {
        return res.status(400).json({ message: erroSenha });
    }

    const senhaHash = hashSenha(senha);

    db.query(
        "INSERT INTO usuarios (usuario,nome,email,senha,tipo) VALUES (?,?,?,?,?)",
        [userLogin, nome, email, senhaHash, tipo],
        async (err, result) => {
            if (err) return res.status(500).json(err);

            const tipoUsuario = tipo ? tipo.toLowerCase() : "";
            const isAdmin = tipoUsuario === "admin" || tipoUsuario === "administrador";

            // Enviar e-mail de boas-vindas / verificação via Amazon SES apenas se for administrador
            if (isAdmin && email) {
                await enviarEmailBoasVindas(email, nome, senha);
            }

            // Registrar Log de Auditoria
            const ipUsuario = req.ip || req.connection.remoteAddress;
            registrarLog(1, "CRIOU_USUARIO", `Usuário #${result.insertId}`, `Criado usuário ${userLogin} (${tipo})`, ipUsuario);

            res.json({ message: "Usuário criado com sucesso" });
        }
    );
});

router.get("/", (req, res) => {
    db.query("SELECT * FROM usuarios", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// BUSCAR UM ÚNICO USUÁRIO 
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT id, usuario, nome, email, tipo, consentimento_lgpd FROM usuarios WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ message: "Usuário não encontrado" });
        }
    });
});

// ATUALIZAR CONSENTIMENTO LGPD
router.put("/:id/consentimento", (req, res) => {
    const { id } = req.params;
    db.query(
        "UPDATE usuarios SET consentimento_lgpd = 1, data_consentimento_lgpd = NOW() WHERE id = ?",
        [id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Consentimento parental e LGPD aceito com sucesso!" });
        }
    );
});

router.put("/:id", (req, res) => {
    const { usuario, nome, email, tipo, senha } = req.body;
    const userLogin = usuario || nome;

    const ipUsuario = req.ip || req.connection.remoteAddress;

    if (senha) {
        const erroSenha = validarSenhaForte(senha);
        if (erroSenha) {
            return res.status(400).json({ message: erroSenha });
        }

        const senhaHash = hashSenha(senha);
        db.query(
            "UPDATE usuarios SET usuario=?, nome=?, email=?, tipo=?, senha=? WHERE id=?",
            [userLogin, nome, email, tipo, senhaHash, req.params.id],
            (err) => {
                if (err) return res.status(500).json(err);

                registrarLog(1, "EDITOU_USUARIO", `Usuário #${req.params.id}`, `Editado usuário ${userLogin}`, ipUsuario);

                res.json({ message: "Usuário e senha atualizados com sucesso!" });
            }
        );
    } else {
        db.query(
            "UPDATE usuarios SET usuario=?, nome=?, email=?, tipo=? WHERE id=?",
            [userLogin, nome, email, tipo, req.params.id],
            (err) => {
                if (err) return res.status(500).json(err);

                registrarLog(1, "EDITOU_USUARIO", `Usuário #${req.params.id}`, `Editado usuário ${userLogin}`, ipUsuario);

                res.json({ message: "Usuário atualizado com sucesso!" });
            }
        );
    }
});



router.delete("/:id", (req, res) => {
    const { id } = req.params;

    db.query("SELECT email, tipo FROM usuarios WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const usuario = results[0];

        if (usuario.tipo && usuario.tipo.toLowerCase() === 'admin') {
            return res.status(403).json({ message: "Este tipo de usuário não pode ser excluído." });
        }

        const emailUsuario = usuario.email;

        db.query("DELETE FROM usuarios WHERE id=?", [id], async (deleteErr) => {
            if (deleteErr) return res.status(500).json(deleteErr);

            if (emailUsuario) {
                await removerIdentidadeSES(emailUsuario);
            }

            const ipUsuario = req.ip || req.connection.remoteAddress;
            registrarLog(1, "EXCLUIU_USUARIO", `Usuário #${id}`, `Excluído usuário #${id}`, ipUsuario);

            res.json({ message: "Usuário excluído e identidade removida do AWS SES" });
        });
    });
});

module.exports = router;