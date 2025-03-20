const express = require('express');
const router = express.Router();
const { getComics, addComic, toggleReadStatus, deleteComic, getReadingStats, scanFolderAndInsert, uploadComicStructure, getComicsByCollection, updateComic } = require('../controllers/comicController');

router.get('/', getComics);
router.post('/', addComic);
router.patch('/:id/toggle-read', toggleReadStatus);
router.delete('/:id', deleteComic);
router.get('/stats', getReadingStats); // Nueva ruta para estadísticas
router.post('/scan', scanFolderAndInsert); // Antiguo endpoint para carga masiva
router.post('/uploadStructure', uploadComicStructure); // Nuevo endpoint para la estructura
router.get('/collection/:id', getComicsByCollection);
// Endpoint para actualizar un cómic (por ejemplo, para cambiar estado, rating, comentario, etc.)
router.patch('/:id', updateComic);

module.exports = router;
