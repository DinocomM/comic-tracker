// routes/collectionRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getCollections, 
  createCollection, 
  updateCollection, 
  deleteCollection, 
  uploadCollectionStructure, 
  markCollectionReadStatus, 
  getCollection 
} = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rutas generales de colecciones
router.get('/', getCollections);
router.post('/', createCollection);
router.patch('/:id', updateCollection);
router.delete('/:id', deleteCollection);
router.post('/uploadStructure', uploadCollectionStructure);
router.patch('/:id/mark-read', markCollectionReadStatus);
router.get('/:id', getCollection);

module.exports = router;




// const express = require('express');
// const router = express.Router();
// const { getCollections, createCollection, updateCollection, deleteCollection, uploadCollectionStructure, markCollectionReadStatus } = require('../controllers/collectionController');
// const authMiddleware = require('../middleware/authMiddleware');

// router.use(authMiddleware);

// router.get('/', getCollections);
// router.post('/', createCollection);
// router.patch('/:id', updateCollection);
// router.delete('/:id', deleteCollection);
// router.post('/uploadStructure', uploadCollectionStructure); // Nuevo endpoint
// router.patch('/:id/mark-read', markCollectionReadStatus);

// router.get('/:id', async (req, res) => {
//     try {
//       const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id });
//       if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });
//       res.json(collection);
//     } catch (error) {
//       res.status(500).json({ message: 'Error al obtener la colección', error });
//     }
//   });
  
  


// module.exports = router;
