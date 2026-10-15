const db = require("../config/db");

function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "Token de autenticação não fornecido." });
    }

    db.query("SELECT * FROM usuarios WHERE token = ?", [token], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro no servidor ao verificar token." });

        if (results.length === 0) {
            return res.status(403).json({ message: "Token inválido ou expirado." });
        }

        req.user = results[0];
        next();
    });
}

module.exports = verificarToken;