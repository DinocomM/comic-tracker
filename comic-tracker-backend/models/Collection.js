// models/Collection.js
const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  comment: { type: String },
  rating: { 
        type: Number, 
        default: null,
        min: [0, 'El rating debe ser al menos 1'],
        max: [5, 'El rating no puede ser mayor a 5']
      },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null }
});

module.exports = mongoose.model('Collection', CollectionSchema);





// // models/Collection.js
// const mongoose = require('mongoose');

// const CollectionSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   // Opcional: podrías agregar un arreglo de comics si deseas almacenar referencias
//   comment: { type: String },
//   rating: { 
//     type: Number, 
//     default: null,
//     min: [1, 'El rating debe ser al menos 1'],
//     max: [5, 'El rating no puede ser mayor a 5']
//   },
// });

// module.exports = mongoose.model('Collection', CollectionSchema);
