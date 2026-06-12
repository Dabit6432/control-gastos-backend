const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'control_gastos_secret_123';

router.post('/registro', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });

  const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  if (existe.rows.length > 0)
    return res.status(400).json({ error: 'El email ya está registrado' });

  const hash = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3)', [nombre, email, hash]);

  res.json({ mensaje: 'Usuario registrado correctamente' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });

  const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  const usuario = resultado.rows[0];
  if (!usuario)
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });

  const passwordCorrecta = await bcrypt.compare(password, usuario.password);
  if (!passwordCorrecta)
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });

  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token, nombre: usuario.nombre, id: usuario.id });
});

module.exports = router;