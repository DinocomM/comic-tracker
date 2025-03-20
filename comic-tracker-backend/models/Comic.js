// models/Comic.js
const mongoose = require('mongoose');

const ComicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  directories: { type: [String] },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  comment: { type: String },
  rating: { 
    type: Number, 
    default: null,
    min: [1, 'El rating debe ser al menos 1'],
    max: [5, 'El rating no puede ser mayor a 5']
  },
  collection: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Collection',
    required: true
  }
});

module.exports = mongoose.model('Comic', ComicSchema);


// const ComicSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   path: { type: String, required: true },
//   directories: { type: [String] },
//   isRead: { type: Boolean, default: false },
//   readAt: { type: Date, default: null },
//   collection: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Collection',
//     required: true // si es obligatorio tener la colección
//   }
// });

// module.exports = mongoose.model('Comic', ComicSchema);



// const mongoose = require('mongoose');

// const ComicSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     path: { type: String, required: true },
//     isRead: { type: Boolean, default: false },
//     readAt: { type: Date, default: null } // Guardará la fecha cuando se marque como leído
// });

// const Comic = mongoose.model('Comic', ComicSchema);

// module.exports = Comic;
