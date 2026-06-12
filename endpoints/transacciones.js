const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/resumen', (req, res) => {
  const ingresos = db.prepare(`
    SELECT COALESCE(SUM(monto), 0) as total
    FROM transacciones
    WHERE usuario_id = ? AND tipo = 'ingreso'
  `).get(req.usuario.id);
  const gastos = db.prepare(`
    SELECT COALESCE(SUM(monto), 0) as total
    FROM transacciones
    WHERE usuario_id = ? AND tipo = 'gasto'
  `).get(req.usuario.id);
  res.json({
    ingresos: ingresos.total,
    gastos: gastos.total,
    balance: ingresos.total - gastos.total
  });
});

router.get('/', (req, res) => {
  const transacciones = db.prepare(`
    SELECT t.*, c.nombre as categoria
    FROM transacciones t
    JOIN categorias c ON t.categoria_id = c.id
    WHERE t.usuario_id = ?
    ORDER BY t.fecha DESC
  `).all(req.usuario.id);
  res.json(transacciones);
});

router.post('/', (req, res) => {
  const { descripcion, monto, tipo, categoria_id, fecha } = req.body;
  if (!descripcion || !monto || !tipo || !categoria_id || !fecha)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  const resultado = db.prepare(`
    INSERT INTO transacciones (descripcion, monto, tipo, categoria_id, fecha, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(descripcion, monto, tipo, categoria_id, fecha, req.usuario.id);
  res.json({ id: resultado.lastInsertRowid, descripcion, monto, tipo, categoria_id, fecha });
});

router.get('/:id', (req, res) => {
  const transaccion = db.prepare(`
    SELECT t.*, c.nombre as categoria
    FROM transacciones t
    JOIN categorias c ON t.categoria_id = c.id
    WHERE t.id = ? AND t.usuario_id = ?
  `).get(req.params.id, req.usuario.id);
  if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' });
  res.json(transaccion);
});

router.put('/:id', (req, res) => {
  const { descripcion, monto, tipo, categoria_id, fecha } = req.body;
  if (!descripcion || !monto || !tipo || !categoria_id || !fecha)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  db.prepare(`
    UPDATE transacciones
    SET descripcion = ?, monto = ?, tipo = ?, categoria_id = ?, fecha = ?
    WHERE id = ? AND usuario_id = ?
  `).run(descripcion, monto, tipo, categoria_id, fecha, req.params.id, req.usuario.id);
  res.json({ id: req.params.id, descripcion, monto, tipo, categoria_id, fecha });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM transacciones WHERE id = ? AND usuario_id = ?')
    .run(req.params.id, req.usuario.id);
  res.json({ mensaje: 'Transacción eliminada' });
});

module.exports = router;