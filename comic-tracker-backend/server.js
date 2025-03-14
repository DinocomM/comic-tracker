// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
// (Puedes importar otras rutas, por ejemplo, de cómics, etc.)

const app = express();

// Aumenta el límite del body parser si es necesario
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(error => console.error('Error al conectar a MongoDB:', error));

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes);
// Otros endpoints (por ejemplo, /api/comics) se agregan aquí

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
