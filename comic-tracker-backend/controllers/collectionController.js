// controllers/collectionController.js
const Collection = require('../models/Collection');

const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user._id });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener colecciones', error });
  }
};

const createCollection = async (req, res) => {
  try {
    const { name } = req.body;
    const collection = new Collection({ name, user: req.user._id });
    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear colección', error });
  }
};

const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    // Verifica que la colección pertenece al usuario autenticado
    const collection = await Collection.findOne({ _id: id, user: req.user._id });
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });
    collection.name = name;
    await collection.save();
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar colección', error });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findOneAndDelete({ _id: id, user: req.user._id });
    if (!collection) return res.status(404).json({ message: 'Colección no encontrada' });
    res.json({ message: 'Colección eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar colección', error });
  }
};

module.exports = { getCollections, createCollection, updateCollection, deleteCollection };
