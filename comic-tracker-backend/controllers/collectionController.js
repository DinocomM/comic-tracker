// controllers/collectionController.js
const Collection = require('../models/Collection');
const Comic = require('../models/Comic');

// const getCollections = async (req, res) => {
//   try {
//     const collections = await Collection.find({ user: req.user._id });
//     res.json(collections);
//   } catch (error) {
//     res.status(500).json({ message: 'Error al obtener colecciones', error });
//   }
// };

const getCollections = async (req, res) => {
  try {
    // Obtener las colecciones del usuario y convertirlas a objetos "lean" para poder modificarlos
    const collections = await Collection.find({ user: req.user._id }).lean();
    
    // Para cada colección, obtener los cómics asociados y calcular si todos están leídos
    const collectionsWithAllRead = await Promise.all(
      collections.map(async (col) => {
        const comics = await Comic.find({ collection: col._id });
        // Si hay cómics y todos tienen isRead true, allRead es true; de lo contrario, false.
        col.allRead = comics.length > 0 && comics.every(c => c.isRead);
        return col;
      })
    );
    
    res.json(collectionsWithAllRead);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener colecciones', error });
  }
};


const createCollection = async (req, res) => {
  try {
    const { name, comment, rating } = req.body;
    const collection = new Collection({ name, comment, rating, user: req.user._id });
    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear colección', error });
  }
};

const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, comment, rating } = req.body;
    // Verifica que la colección pertenece al usuario autenticado
    const collection = await Collection.findOne({ _id: id, user: req.user._id });
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });
    
    if (name !== undefined) collection.name = name;
    if (comment !== undefined) collection.comment = comment;
    if (rating !== undefined) collection.rating = rating;
    
    await collection.save();
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar colección', error });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    // Busca la colección asegurándose de que pertenece al usuario autenticado
    const collection = await Collection.findOne({ _id: id, user: req.user._id });
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });
    
    // Elimina todos los cómics asociados a esa colección
    await Comic.deleteMany({ collection: collection._id });
    // Elimina la colección
    await Collection.findOneAndDelete({ _id: id, user: req.user._id });
    
    res.json({ message: 'Colección y sus cómics eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar colección', error });
  }
};

const uploadCollectionStructure = async (req, res) => {
  const { collectionName, comics, mode } = req.body;
  try {
    // Busca si la colección ya existe para el usuario autenticado
    let collection = await Collection.findOne({ name: collectionName, user: req.user._id });
    if (collection) {
      // La colección existe, procesa según el modo
      if (mode === 'append') {
        const comicsToInsert = comics.map(c => ({ ...c, collection: collection._id }));
        await Comic.insertMany(comicsToInsert);
        return res.json({ message: 'Cómics añadidos a la colección existente.' });
      } else if (mode === 'overwrite') {
        await Comic.deleteMany({ collection: collection._id });
        const comicsToInsert = comics.map(c => ({ ...c, collection: collection._id }));
        await Comic.insertMany(comicsToInsert);
        return res.json({ message: 'La colección ha sido sobrescrita con la nueva estructura.' });
      } else {
        return res.status(400).json({ message: 'Modo inválido.' });
      }
    } else {
      collection = new Collection({ name: collectionName, user: req.user._id });
      await collection.save();
      const comicsToInsert = comics.map(c => ({ ...c, collection: collection._id }));
      await Comic.insertMany(comicsToInsert);
      return res.status(201).json({ message: 'Colección creada y cómics insertados.' });
    }
  } catch (error) {
    console.error('Error en uploadCollectionStructure:', error);
    res.status(500).json({ message: 'Error al procesar la estructura de la colección.', error });
  }
};

const markCollectionReadStatus = async (req, res) => {
  const { id } = req.params;
  const { isRead } = req.body; // Se espera un boolean: true o false
  try {
    // Verifica que la colección exista y pertenezca al usuario autenticado
    const collection = await Collection.findOne({ _id: id, user: req.user._id });
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });

    // Prepara el update para todos los cómics asociados
    const update = { isRead };
    if (isRead) {
      update.readAt = new Date();
    } else {
      update.readAt = null;
    }

    // Actualiza todos los cómics que pertenecen a esa colección
    await Comic.updateMany({ collection: collection._id }, update);
    res.json({ message: `Todos los cómics de la colección se han marcado como ${isRead ? 'leídos' : 'no leídos'}.` });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado de lectura de los cómics.', error });
  }
};


module.exports = {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  uploadCollectionStructure ,
  markCollectionReadStatus,
};
