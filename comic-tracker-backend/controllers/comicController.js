const Comic = require('../models/Comic');

// Obtener todos los cómics
const getComics = async (req, res) => {
    try {
        const { isRead, name } = req.query;
        let filter = {};

        if (isRead !== undefined) {
            filter.isRead = isRead === 'true'; // Convertir el string a booleano
        }

        if (name) {
            filter.name = { $regex: name, $options: 'i' }; // Búsqueda parcial, case-insensitive
        }

        const comics = await Comic.find(filter);
        res.json(comics);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los cómics', error });
    }
};


// Agregar un nuevo cómic
const addComic = async (req, res) => {
    try {
        const { name, path } = req.body;
        const newComic = new Comic({ name, path });
        await newComic.save();
        res.status(201).json(newComic);
    } catch (error) {
        res.status(400).json({ message: 'Error al agregar el cómic', error });
    }
};

// Marcar como leído/no leído
const toggleReadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const comic = await Comic.findById(id);
        if (!comic) {
            return res.status(404).json({ message: 'Cómic no encontrado' });
        }
        comic.isRead = !comic.isRead;
        comic.readAt = comic.isRead ? new Date() : null; // Guardar fecha si se marca como leído
        
        await comic.save();
        res.json(comic);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el estado de lectura', error });
    }
};

// Eliminar un cómic
const deleteComic = async (req, res) => {
    try {
        const { id } = req.params;
        await Comic.findByIdAndDelete(id);
        res.json({ message: 'Cómic eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ message: 'Error al eliminar el cómic', error });
    }
};

// Estadisticas
const getReadingStats = async (req, res) => {
    try {
        const totalComics = await Comic.countDocuments();
        const readComics = await Comic.countDocuments({ isRead: true });
        const unreadComics = totalComics - readComics;
        const readPercentage = totalComics > 0 ? (readComics / totalComics) * 100 : 0;

        // Fechas límites
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Inicio de semana
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Inicio de mes
        const startOfYear = new Date(now.getFullYear(), 0, 1); // Inicio de año

        // Contar cómics leídos en cada período
        const weeklyRead = await Comic.countDocuments({ isRead: true, readAt: { $gte: startOfWeek } });
        const monthlyRead = await Comic.countDocuments({ isRead: true, readAt: { $gte: startOfMonth } });
        const yearlyRead = await Comic.countDocuments({ isRead: true, readAt: { $gte: startOfYear } });

        res.json({
            totalComics,
            readComics,
            unreadComics,
            readPercentage,
            weeklyRead,
            monthlyRead,
            yearlyRead
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estadísticas', error });
    }
};

const { scanAndInsertComics } = require('../utils/scanFolder');

// Endpoint para escanear una carpeta y guardar los cómics
const scanFolderAndInsert = async (req, res) => {
  try {
    const { folderPath } = req.body;
    if (!folderPath) {
      return res.status(400).json({ message: 'Debe enviarse folderPath en el body.' });
    }
    const comics = await scanAndInsertComics(folderPath);
    res.status(201).json({ message: 'Cómics escaneados e insertados correctamente.', comics });
  } catch (error) {
    res.status(500).json({ message: 'Error al escanear la carpeta', error });
  }
};

const uploadComicStructure = async (req, res) => {
    try {
      const { comics } = req.body;
      if (!comics || !Array.isArray(comics)) {
        return res.status(400).json({ message: 'Datos de cómics inválidos.' });
      }
      // Inserta los cómics usando insertMany
      const savedComics = await Comic.insertMany(comics);
      res.status(201).json({ message: 'Cómics insertados correctamente.', comics: savedComics });
    } catch (error) {
      res.status(500).json({ message: 'Error al insertar los cómics.', error });
    }
  };

module.exports = {
  getComics,
  addComic,
  toggleReadStatus,
  deleteComic,
  getReadingStats,
  scanFolderAndInsert,  // Endpoint antiguo - lo mantenemos
  uploadComicStructure  // Nuevo endpoint para la subida de los comics
};

