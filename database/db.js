const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necesario para Render
});

// Función que crea las tablas y datos de prueba
async function inicializarDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id       SERIAL PRIMARY KEY,
      nombre   TEXT NOT NULL,
      email    TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categorias (
      id     SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      tipo   TEXT NOT NULL CHECK(tipo IN ('ingreso', 'gasto'))
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transacciones (
      id           SERIAL PRIMARY KEY,
      descripcion  TEXT NOT NULL,
      monto        REAL NOT NULL,
      tipo         TEXT NOT NULL CHECK(tipo IN ('ingreso', 'gasto')),
      categoria_id INTEGER NOT NULL REFERENCES categorias(id),
      fecha        TEXT NOT NULL,
      usuario_id   INTEGER NOT NULL REFERENCES usuarios(id)
    );
  `);

  // Categorías de prueba
  const cats = await pool.query('SELECT COUNT(*) FROM categorias');
  if (parseInt(cats.rows[0].count) === 0) {
    const lista = [
      ['Salario', 'ingreso'], ['Freelance', 'ingreso'], ['Inversiones', 'ingreso'],
      ['Comida', 'gasto'], ['Renta', 'gasto'], ['Transporte', 'gasto'],
      ['Entretenimiento', 'gasto'], ['Salud', 'gasto'], ['Ropa', 'gasto'], ['Servicios', 'gasto']
    ];
    for (const [nombre, tipo] of lista) {
      await pool.query('INSERT INTO categorias (nombre, tipo) VALUES ($1, $2)', [nombre, tipo]);
    }
  }

  // Usuario de prueba
  const bcrypt = require('bcryptjs');
  const users = await pool.query('SELECT COUNT(*) FROM usuarios');
  if (parseInt(users.rows[0].count) === 0) {
    const hash = bcrypt.hashSync('123456', 10);
    await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3)',
      ['Usuario Prueba', 'prueba@email.com', hash]
    );
  }

  // Transacciones de prueba
  const trans = await pool.query('SELECT COUNT(*) FROM transacciones');
  if (parseInt(trans.rows[0].count) === 0) {
    const lista = [
      ['Salario enero', 15000, 'ingreso', 1, '2025-01-05', 1],
      ['Proyecto freelance', 5000, 'ingreso', 2, '2025-01-10', 1],
      ['Renta enero', 4500, 'gasto', 5, '2025-01-01', 1],
      ['Supermercado', 850, 'gasto', 4, '2025-01-07', 1],
      ['Netflix + Spotify', 350, 'gasto', 7, '2025-01-08', 1],
      ['Gasolina', 600, 'gasto', 6, '2025-01-09', 1],
    ];
    for (const t of lista) {
      await pool.query(
        'INSERT INTO transacciones (descripcion, monto, tipo, categoria_id, fecha, usuario_id) VALUES ($1, $2, $3, $4, $5, $6)',
        t
      );
    }
  }
}

inicializarDB().catch(err => console.error('Error inicializando DB:', err));

module.exports = pool;