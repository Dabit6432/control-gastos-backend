const express = require('express');
const cors = require('cors');
const authRouter = require('./endpoints/auth');
const transaccionesRouter = require('./endpoints/transacciones');
const categoriasRouter = require('./endpoints/categorias');
const verificarToken = require('./middleware/auth');

const app = express();
const PORT = 3001; // puerto diferente para no chocar con tu otro backend

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'Control de gastos API funcionando' });
});

// rutas públicas
app.use('/auth', authRouter);

// rutas protegidas
app.use('/transacciones', verificarToken, transaccionesRouter);
app.use('/categorias',    verificarToken, categoriasRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});