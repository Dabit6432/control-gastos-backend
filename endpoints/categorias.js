const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /categorias — todas
router.get('/', (req, res) => {
  const categorias = db.prepare('SELECT * FROM categorias').all();
  res.json(categorias);
});

// GET /categorias/ingresos — solo ingresos
router.get('/ingresos', (req, res) => {
  const categorias = db.prepare("SELECT * FROM categorias WHERE tipo = 'ingreso'").all();
  res.json(categorias);
});

// GET /categorias/gastos — solo gastos
router.get('/gastos', (req, res) => {
  const categorias = db.prepare("SELECT * FROM categorias WHERE tipo = 'gasto'").all();
  res.json(categorias);
});

module.exports = router;