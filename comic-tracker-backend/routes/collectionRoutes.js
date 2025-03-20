// routes/collectionRoutes.js
const express = require('express');
const router = express.Router();
const { getCollections, createCollection, updateCollection, deleteCollection, uploadCollectionStructure, markCollectionReadStatus } = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getCollections);
router.post('/', createCollection);
router.patch('/:id', updateCollection);
router.delete('/:id', deleteCollection);
router.post('/uploadStructure', uploadCollectionStructure); // Nuevo endpoint
router.patch('/:id/mark-read', markCollectionReadStatus);


module.exports = router;
