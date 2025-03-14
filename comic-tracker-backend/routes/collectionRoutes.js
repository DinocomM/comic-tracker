// routes/collectionRoutes.js
const express = require('express');
const router = express.Router();
const { getCollections, createCollection, updateCollection, deleteCollection } = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplica el middleware a todas las rutas de colecciones
router.use(authMiddleware);

router.get('/', getCollections);
router.post('/', createCollection);
router.patch('/:id', updateCollection);
router.delete('/:id', deleteCollection);

module.exports = router;
