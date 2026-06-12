const Database = require('better-sqlite3');
const db = new Database('control_gastos.db');

// Tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre   TEXT    NOT NULL,
    email    TEXT    NOT NULL UNIQUE,
    password TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categorias (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre  TEXT NOT NULL,
    tipo    TEXT NOT NULL CHECK(tipo IN ('ingreso', 'gasto'))
  );

  CREATE TABLE IF NOT EXISTS transacciones (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion  TEXT    NOT NULL,
    monto        REAL    NOT NULL,
    tipo         TEXT    NOT NULL CHECK(tipo IN ('ingreso', 'gasto')),
    categoria_id INTEGER NOT NULL,
    fecha        TEXT    NOT NULL,
    usuario_id   INTEGER NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)
  );
`);

// Datos de prueba — categorías
const totalCategorias = db.prepare('SELECT COUNT(*) as total FROM categorias').get();
if (totalCategorias.total === 0) {
  const insertar = db.prepare('INSERT INTO categorias (nombre, tipo) VALUES (?, ?)');
  insertar.run('Salario',         'ingreso');
  insertar.run('Freelance',       'ingreso');
  insertar.run('Inversiones',     'ingreso');
  insertar.run('Comida',          'gasto');
  insertar.run('Renta',           'gasto');
  insertar.run('Transporte',      'gasto');
  insertar.run('Entretenimiento', 'gasto');
  insertar.run('Salud',           'gasto');
  insertar.run('Ropa',            'gasto');
  insertar.run('Servicios',       'gasto');
}

// Datos de prueba — usuario
const bcrypt = require('bcryptjs');
const totalUsuarios = db.prepare('SELECT COUNT(*) as total FROM usuarios').get();
if (totalUsuarios.total === 0) {
  const hash = bcrypt.hashSync('123456', 10);
  db.prepare('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)').run('Usuario Prueba', 'prueba@email.com', hash);
}

// Datos de prueba — transacciones
const totalTransacciones = db.prepare('SELECT COUNT(*) as total FROM transacciones').get();
if (totalTransacciones.total === 0) {
  const ins = db.prepare('INSERT INTO transacciones (descripcion, monto, tipo, categoria_id, fecha, usuario_id) VALUES (?, ?, ?, ?, ?, ?)');
  ins.run('Salario enero',       15000, 'ingreso', 1, '2025-01-05', 1);
  ins.run('Proyecto freelance',   5000, 'ingreso', 2, '2025-01-10', 1);
  ins.run('Renta enero',          4500, 'gasto',   5, '2025-01-01', 1);
  ins.run('Supermercado',          850, 'gasto',   4, '2025-01-07', 1);
  ins.run('Netflix + Spotify',     350, 'gasto',   7, '2025-01-08', 1);
  ins.run('Gasolina',              600, 'gasto',   6, '2025-01-09', 1);
  ins.run('Salario febrero',     15000, 'ingreso', 1, '2025-02-05', 1);
  ins.run('Consulta médica',       800, 'gasto',   8, '2025-02-12', 1);
  ins.run('Ropa',                 1200, 'gasto',   9, '2025-02-15', 1);
  ins.run('Freelance diseño',     3000, 'ingreso', 2, '2025-02-20', 1);
  ins.run('Renta febrero',        4500, 'gasto',   5, '2025-02-01', 1);
  ins.run('Restaurante',           450, 'gasto',   4, '2025-02-22', 1);
}

module.exports = db;