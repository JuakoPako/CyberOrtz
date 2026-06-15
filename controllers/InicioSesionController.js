const db = require('../config/db');

// ── POST /api/login — Validar credenciales ────────────────
const iniciarSesion = (req, res) => {
  const usuario = req.body.usuario;
  const password = req.body.password;

  if (!usuario || !password) {
    res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
    return;
  }

  db.query(
    'SELECT * FROM usuarios WHERE usuario = ? AND password = ?',
    [usuario, password],
    (err, filas) => {
      if (err) {
        res.status(500).json({ error: 'Error al validar el login' });
        return;
      }

      if (filas.length === 0) {
        // No se encontró ninguna fila que coincida
        res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        return;
      }

      // Si llega aquí, las credenciales son correctas
      res.json({ mensaje: 'Login correcto', usuario: filas[0].usuario });
    }
  );
};

module.exports = { iniciarSesion };