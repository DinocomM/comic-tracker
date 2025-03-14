const mongoose = require('mongoose');

const ComicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null } // Guardará la fecha cuando se marque como leído
});

const Comic = mongoose.model('Comic', ComicSchema);

module.exports = Comic;
