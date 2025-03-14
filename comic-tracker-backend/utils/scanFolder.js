const fs = require('fs').promises;
const path = require('path');
const Comic = require('../models/Comic');

// Función recursiva para escanear la carpeta
async function scanFolder(dir, baseDir) {
  let comics = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recorrer subcarpetas
      const subComics = await scanFolder(fullPath, baseDir);
      comics = comics.concat(subComics);
    } else {
      // Consideramos que es un cómic si tiene una extensión válida
      const ext = path.extname(entry.name).toLowerCase();
      const validExtensions = ['.cbr', '.cbz', '.pdf']; // Puedes agregar más
      if (validExtensions.includes(ext)) {
        // Calcular la ruta relativa a la carpeta base
        const relativePath = path.relative(baseDir, fullPath);
        // Extraer las carpetas (directorio) de la ruta relativa
        const directories = path.dirname(relativePath).split(path.sep)
          .filter(d => d && d !== '.');
        // El nombre del cómic es el nombre del archivo sin extensión
        const comicName = path.basename(entry.name, ext);
        comics.push({
          name: comicName,
          path: fullPath,
          relativePath,
          directories,
          isRead: false,
          readAt: null
        });
      }
    }
  }
  
  return comics;
}

// Función que escanea la carpeta base y guarda los cómics en la DB
async function scanAndInsertComics(baseDir) {
  try {
    const comics = await scanFolder(baseDir, baseDir);
    console.log(`Encontrados ${comics.length} cómics.`);
    if (comics.length > 0) {
      const savedComics = await Comic.insertMany(comics);
      return savedComics;
    }
    return [];
  } catch (error) {
    throw error;
  }
}

module.exports = { scanFolder, scanAndInsertComics };
