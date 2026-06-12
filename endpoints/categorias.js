const express = require('express');
const router = express.Router();
const pool = require('../database/db');

router.get('/', async (req, res) => {
  const resultado = await pool.query('SELECT * FROM categorias');
  res.json(resultado.rows);
});

router.get('/ingresos', async (req, res) => {
  const resultado = await pool.query("SELECT * FROM categorias WHERE tipo = 'ingreso'");
  res.json(resultado.rows);
});

router.get('/gastos', async (req, res) => {
  const resultado = await pool.query("SELECT * FROM categorias WHERE tipo = 'gasto'");
  res.json(resultado.rows);
});

module.exports = router;