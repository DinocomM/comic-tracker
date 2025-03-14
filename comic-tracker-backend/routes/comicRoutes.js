const express = require('express');
const router = express.Router();
const { getComics, addComic, toggleReadStatus, deleteComic, getReadingStats, scanFolderAndInsert, uploadComicStructure  } = require('../controllers/comicController');

router.get('/', getComics);
router.post('/', addComic);
router.patch('/:id/toggle-read', toggleReadStatus);
router.delete('/:id', deleteComic);
router.get('/stats', getReadingStats); // Nueva ruta para estadísticas
router.post('/scan', scanFolderAndInsert); // Antiguo endpoint para carga masiva
router.post('/uploadStructure', uploadComicStructure); // Nuevo endpoint para la estructura

module.exports = router;
