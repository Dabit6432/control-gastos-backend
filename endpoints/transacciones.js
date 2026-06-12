const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// GET /transacciones/resumen
router.get('/resumen', async (req, res) => {
  const ingresos = await pool.query(
    "SELECT COALESCE(SUM(monto), 0) as total FROM transacciones WHERE usuario_id = $1 AND tipo = 'ingreso'",
    [req.usuario.id]
  );
  const gastos = await pool.query(
    "SELECT COALESCE(SUM(monto), 0) as total FROM transacciones WHERE usuario_id = $1 AND tipo = 'gasto'",
    [req.usuario.id]
  );
  res.json({
    ingresos: Number(ingresos.rows[0].total),
    gastos: Number(gastos.rows[0].total),
    balance: Number(ingresos.rows[0].total) - Number(gastos.rows[0].total)
  });
});

// GET /transacciones
router.get('/', async (req, res) => {
  const resultado = await pool.query(`
    SELECT t.*, c.nombre as categoria
    FROM transacciones t
    JOIN categorias c ON t.categoria_id = c.id
    WHERE t.usuario_id = $1
    ORDER BY t.fecha DESC
  `, [req.usuario.id]);
  res.json(resultado.rows);
});

// POST /transacciones
router.post('/', async (req, res) => {
  const { descripcion, monto, tipo, categoria_id, fecha } = req.body;
  if (!descripcion || !monto || !tipo || !categoria_id || !fecha)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });

  const resultado = await pool.query(`
    INSERT INTO transacciones (descripcion, monto, tipo, categoria_id, fecha, usuario_id)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
  `, [descripcion, monto, tipo, categoria_id, fecha, req.usuario.id]);

  res.json(resultado.rows[0]);
});

// GET /transacciones/:id
router.get('/:id', async (req, res) => {
  const resultado = await pool.query(`
    SELECT t.*, c.nombre as categoria
    FROM transacciones t
    JOIN categorias c ON t.categoria_id = c.id
    WHERE t.id = $1 AND t.usuario_id = $2
  `, [req.params.id, req.usuario.id]);

  if (resultado.rows.length === 0) return res.status(404).json({ error: 'Transacción no encontrada' });
  res.json(resultado.rows[0]);
});

// PUT /transacciones/:id
router.put('/:id', async (req, res) => {
  const { descripcion, monto, tipo, categoria_id, fecha } = req.body;
  if (!descripcion || !monto || !tipo || !categoria_id || !fecha)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });

  await pool.query(`
    UPDATE transacciones
    SET descripcion = $1, monto = $2, tipo = $3, categoria_id = $4, fecha = $5
    WHERE id = $6 AND usuario_id = $7
  `, [descripcion, monto, tipo, categoria_id, fecha, req.params.id, req.usuario.id]);

  res.json({ id: req.params.id, descripcion, monto, tipo, categoria_id, fecha });
});

// DELETE /transacciones/:id
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM transacciones WHERE id = $1 AND usuario_id = $2', [req.params.id, req.usuario.id]);
  res.json({ mensaje: 'Transacción eliminada' });
});

module.exports = router;