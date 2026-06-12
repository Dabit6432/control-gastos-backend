const jwt = require('jsonwebtoken');
const SECRET = 'control_gastos_secret_123';

module.exports = function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const datos = jwt.verify(token, SECRET);
    req.usuario = datos;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};