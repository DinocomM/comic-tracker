import React, { useState } from 'react';
import { Container, Form, Button, ListGroup, Alert } from 'react-bootstrap';
import ComicService from '../services/ComicService';

const FolderScanner = () => {
  const [filesInfo, setFilesInfo] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Maneja la selección de carpeta
  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files);
    const comicsData = files.map(file => {
      const relativePath = file.webkitRelativePath; // Ej.: "W/WITCHER/The Witcher #1.pdf"
      const pathParts = relativePath.split('/'); // Separa la ruta en un arreglo
      // El nombre del cómic es el nombre del archivo sin extensión
      const name = file.name.replace(/\.[^/.]+$/, '');
      const directories = pathParts.slice(0, -1); // Todas las carpetas de la ruta
      return {
        name,
        path: relativePath, // Se envía el campo "path" requerido por el modelo
        directories,
        isRead: false,
        readAt: null
      };
    });
    setFilesInfo(comicsData);
  };

  // Envía la estructura de cómics al backend
  const handleUpload = async () => {
    try {
      const payload = { comics: filesInfo };
      console.log("Tamaño del payload:", JSON.stringify(payload).length);
      const response = await ComicService.uploadComicStructure(payload);
      setUploadStatus({ type: 'success', message: 'Estructura subida correctamente.' });
      console.log(response.data);
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Error al subir la estructura.' });
      console.error(error);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Escanear Carpeta</h2>
      <Form.Group controlId="folderInput">
        <Form.Label>Selecciona una carpeta:</Form.Label>
        <Form.Control
          type="file"
          webkitdirectory="true"
          multiple
          onChange={handleFolderSelect}
        />
      </Form.Group>
      
      {filesInfo.length > 0 && (
        <>
          <h4 className="mt-3">Archivos detectados:</h4>
          <ListGroup>
            {filesInfo.map((comic, index) => (
              <ListGroup.Item key={index}>
                <strong>{comic.name}</strong> - {comic.path}
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button variant="primary" className="mt-3" onClick={handleUpload}>
            Subir Estructura
          </Button>
        </>
      )}

      {uploadStatus && (
        <Alert variant={uploadStatus.type === 'success' ? 'success' : 'danger'} className="mt-3">
          {uploadStatus.message}
        </Alert>
      )}
    </Container>
  );
};

export default FolderScanner;
