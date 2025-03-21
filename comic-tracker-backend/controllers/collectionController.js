// controllers/collectionController.js
const Collection = require('../models/Collection');
const Comic = require('../models/Comic');

const getCollections = async (req, res) => {
  try {
    let filter = { user: req.user._id };
    if (req.query.parent !== undefined) {
      filter.parent = req.query.parent === 'null' ? null : req.query.parent;
    }
    const collections = await Collection.find(filter).lean();
    // Calcular campo "allRead" para cada colección
    const collectionsWithAllRead = await Promise.all(
      collections.map(async (col) => {
        const comics = await Comic.find({ collection: col._id });
        col.allRead = comics.length > 0 && comics.every(c => c.isRead);
        return col;
      })
    );
    res.json(collectionsWithAllRead);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener colecciones', error });
  }
};

const getCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id });
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });
    res.json(collection);
  } catch (error) {
    console.error("Error en getCollection:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID inválido' });
    }
    res.status(500).json({ message: 'Error al obtener la colección', error });
  }
};

const createCollection = async (req, res) => {
  try {
    const { name, comment, rating, parent } = req.body;  // ahora extraemos parent
    const collection = new Collection({
      name,
      comment,
      rating,
      user: req.user._id,
      parent: parent || null  // asignamos parent, o null si no se envía
    });
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
    const collection = await Collection.findOne({ _id: id, user: req.user._id });
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });
    
    // Elimina los cómics asociados a esta colección
    await Comic.deleteMany({ collection: collection._id });
    // Elimina subcolecciones recursivamente
    await deleteSubcollectionsRecursively(collection._id, req.user._id);
    // Elimina la colección principal
    await Collection.findOneAndDelete({ _id: id, user: req.user._id });
    
    res.json({ message: 'Colección, subcolecciones y sus cómics eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar colección', error });
  }
};

const deleteSubcollectionsRecursively = async (parentId, userId) => {
  const subs = await Collection.find({ parent: parentId, user: userId });
  for (const sub of subs) {
    await Comic.deleteMany({ collection: sub._id });
    await deleteSubcollectionsRecursively(sub._id, userId);
    await Collection.findOneAndDelete({ _id: sub._id, user: userId });
  }
};

// Función recursiva para procesar la estructura de colección
const processCollectionStructure = async (structure, userId, parentId = null, mode) => {
  // Buscar si ya existe la colección con este nombre, usuario y parent
  let collection = await Collection.findOne({ name: structure.name, user: userId, parent: parentId });
  
  if (collection) {
    if (mode === 'overwrite') {
      // Si se sobrescribe, se eliminan los cómics existentes de esta colección
      await Comic.deleteMany({ collection: collection._id });
    }
    // En modo "append", se mantienen los cómics existentes
  } else {
    // No existe, crear la colección
    collection = new Collection({ name: structure.name, user: userId, parent: parentId });
    await collection.save();
  }
  
  // Insertar cómics en esta colección (si los hay)
  if (structure.comics && structure.comics.length > 0) {
    const comicsToInsert = structure.comics.map(c => ({ ...c, collection: collection._id }));
    await Comic.insertMany(comicsToInsert);
  }
  
  // Procesar recursivamente las subcolecciones, si existen
  if (structure.subcollections && structure.subcollections.length > 0) {
    for (let sub of structure.subcollections) {
      await processCollectionStructure(sub, userId, collection._id, mode);
    }
  }
  return collection;
};

const uploadCollectionStructure = async (req, res) => {
  const { collectionStructure, mode } = req.body;
  try {
    // Procesa la estructura jerárquica recursivamente
    const collection = await processCollectionStructure(collectionStructure, req.user._id, null, mode);
    return res.status(200).json({ message: 'Estructura de colección creada/sobrescrita correctamente', collection });
  } catch (error) {
    console.error('Error en uploadCollectionStructure:', error);
    res.status(500).json({ message: 'Error al procesar la estructura de la colección.', error });
  }
};

// const uploadCollectionStructure = async (req, res) => {
//   const { collectionName, comics, mode } = req.body;
//   try {
//     // Busca si la colección ya existe para el usuario autenticado
//     let collection = await Collection.findOne({ name: collectionName, user: req.user._id });
//     if (collection) {
//       // La colección existe, procesa según el modo
//       if (mode === 'append') {
//         const comicsToInsert = comics.map(c => ({ ...c, collection: collection._id }));
//         await Comic.insertMany(comicsToInsert);
//         return res.json({ message: 'Cómics añadidos a la colección existente.' });
//       } else if (mode === 'overwrite') {
//         await Comic.deleteMany({ collection: collection._id });
//         const comicsToInsert = comics.map(c => ({ ...c, collection: collection._id }));
//         await Comic.insertMany(comicsToInsert);
//         return res.json({ message: 'La colección ha sido sobrescrita con la nueva estructura.' });
//       } else {
//         return res.status(400).json({ message: 'Modo inválido.' });
//       }
//     } else {
//       collection = new Collection({ name: collectionName, user: req.user._id });
//       await collection.save();
//       const comicsToInsert = comics.map(c => ({ ...c, collection: collection._id }));
//       await Comic.insertMany(comicsToInsert);
//       return res.status(201).json({ message: 'Colección creada y cómics insertados.' });
//     }
//   } catch (error) {
//     console.error('Error en uploadCollectionStructure:', error);
//     res.status(500).json({ message: 'Error al procesar la estructura de la colección.', error });
//   }
// };

const markCollectionReadStatus = async (req, res) => {
  const { id } = req.params;
  const { isRead } = req.body;
  try {
    const collection = await Collection.findOne({ _id: id, user: req.user._id });
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });
    const update = { isRead };
    update.readAt = isRead ? new Date() : null;
    await Comic.updateMany({ collection: collection._id }, update);
    res.json({ message: `Todos los cómics se han marcado como ${isRead ? 'leídos' : 'no leídos'}.` });
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
  getCollection,
};
