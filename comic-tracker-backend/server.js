// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
// Otras rutas, por ejemplo, de colecciones o cómics
const collectionRoutes = require('./routes/collectionRoutes'); // Importa rutas de colecciones
const comicRoutes = require('./routes/comicRoutes');           // Importa rutas de cómics


const app = express();

// Configura el body parser con un límite adecuado
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
// Aquí se agregarían otras rutas (por ejemplo, /api/collections)
app.use('/api/collections', collectionRoutes);  // Define la ruta para colecciones
app.use('/api/comics', comicRoutes);             // Define la ruta para cómics

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
