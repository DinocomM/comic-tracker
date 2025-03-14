// models/Collection.js
const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  // Opcional: podrías agregar un arreglo de comics si deseas almacenar referencias
});

module.exports = mongoose.model('Collection', CollectionSchema);
