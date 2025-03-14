import React, { useEffect, useState } from 'react';
import { Table, Container, Button } from 'react-bootstrap';
import ComicService from '../../services/ComicService';

const CollectionList = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener los cómics del backend
  const fetchComics = async () => {
    setLoading(true);
    try {
      const response = await ComicService.getComics();
      setComics(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al obtener los cómics');
      setLoading(false);
    }
  };

  // Obtener los cómics al montar el componente
  useEffect(() => {
    fetchComics();
  }, []);

  // Función para alternar el estado de lectura de un cómic
  const handleToggleRead = async (id) => {
    try {
      await ComicService.updateComicStatus(id);
      fetchComics();
    } catch (err) {
      console.error("Error al actualizar el estado del cómic:", err);
    }
  };

  // Función para eliminar un cómic
  const handleDelete = async (id) => {
    try {
      await ComicService.deleteComic(id);
      fetchComics();
    } catch (err) {
      console.error("Error al eliminar el cómic:", err);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Colecciones</h2>
      {loading && <p>Cargando cómics...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && comics.length === 0 && <p>No se han encontrado cómics.</p>}
      {comics.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Título</th>
              <th>Ruta Relativa</th>
              <th>Carpetas</th>
              <th>Leído</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comics.map((comic) => (
              <tr key={comic._id}>
                <td>{comic.name}</td>
                <td>{comic.relativePath}</td>
                <td>{comic.directories && comic.directories.join(' > ')}</td>
                <td>{comic.isRead ? 'Sí' : 'No'}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleToggleRead(comic._id)}
                    className="me-2"
                  >
                    Alternar Leído
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(comic._id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default CollectionList;
