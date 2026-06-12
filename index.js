const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./endpoints/auth');
const transaccionesRouter = require('./endpoints/transacciones');
const categoriasRouter = require('./endpoints/categorias');
const verificarToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'Control de gastos API funcionando' });
});

app.use('/auth', authRouter);
app.use('/transacciones', verificarToken, transaccionesRouter);
app.use('/categorias', verificarToken, categoriasRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});