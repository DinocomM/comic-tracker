// src/components/Dashboard/CollectionComics.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Form, Modal, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ComicService from '../../services/ComicService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

const CollectionComics = () => {
  const { id } = useParams(); // ID de la colección
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Estado para el modal de comentario
  const [showModal, setShowModal] = useState(false);
  const [selectedComic, setSelectedComic] = useState(null);
  const [newComment, setNewComment] = useState('');

  // Cargar cómics de la colección
  const fetchComics = async () => {
    setLoading(true);
    try {
      const response = await ComicService.getComicsByCollection(id);
      setComics(response.data);
    } catch (err) {
      setError("Error al cargar los cómics");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComics();
  }, [id]);

  // Filtrar cómics por nombre
  const filteredComics = comics.filter((comic) =>
    comic.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Ordenar por título
  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sorted = [...comics].sort((a, b) => {
      if (a.name < b.name) return newOrder === 'asc' ? -1 : 1;
      if (a.name > b.name) return newOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setComics(sorted);
  };

  // Alternar estado "leído"
  const handleToggleRead = async (comic) => {
    try {
      await ComicService.updateComic(comic._id, { isRead: !comic.isRead });
      fetchComics();
    } catch (err) {
      setError("Error al actualizar el estado de lectura");
    }
  };

  // Actualizar rating al hacer clic en una estrella
  const handleRatingUpdate = async (comic, rating) => {
    try {
      await ComicService.updateComic(comic._id, { rating });
      fetchComics();
    } catch (err) {
      setError("Error al actualizar la valoración");
    }
  };

  // Abrir modal para editar comentario
  const openEditModal = (comic) => {
    setSelectedComic(comic);
    setNewComment(comic.comment || '');
    setShowModal(true);
  };

  // Guardar comentario desde el modal
  const handleSaveComment = async () => {
    try {
      await ComicService.updateComic(selectedComic._id, { comment: newComment });
      setShowModal(false);
      setSelectedComic(null);
      fetchComics();
    } catch (err) {
      setError("Error al actualizar el comentario");
    }
  };

  // Eliminar cómic
  const handleDelete = async (comicId) => {
    try {
      await ComicService.deleteComic(comicId);
      fetchComics();
    } catch (err) {
      setError("Error al eliminar el cómic");
    }
  };

  return (
    <Container className="mt-4">
      <h2>Cómics de la Colección</h2>
      <Form.Control
        type="text"
        placeholder="Filtrar por nombre..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-3"
      />
      {loading && <p>Cargando cómics...</p>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th onClick={handleSort} style={{ cursor: 'pointer' }}>
              Título {sortOrder === 'asc' ? '▲' : '▼'}
            </th>
            <th>Ruta</th>
            <th>Leído</th>
            <th>Valoración</th>
            <th>Comentario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredComics.map((comic) => (
            <tr key={comic._id}>
              <td>{comic.name}</td>
              <td>{comic.path}</td>
              <td>
                <Button variant="link" onClick={() => handleToggleRead(comic)} title="Alternar leído">
                  <FontAwesomeIcon icon={faCheckCircle} color={comic.isRead ? 'green' : 'gray'} />
                </Button>
              </td>
              <td>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRatingUpdate(comic, star)}
                    style={{ cursor: 'pointer', marginRight: 3 }}
                    title={`Marcar ${star} estrella${star > 1 ? 's' : ''}`}
                  >
                    <FontAwesomeIcon
                      icon={star <= (comic.rating || 0) ? faStarSolid : faStarRegular}
                      color="gold"
                    />
                  </span>
                ))}
              </td>
              <td>{comic.comment || ''}</td>
              <td>
                <Button variant="link" onClick={() => openEditModal(comic)} title="Editar comentario">
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
                <Button variant="link" onClick={() => handleDelete(comic._id)} title="Eliminar cómic">
                  <FontAwesomeIcon icon={faTrash} color="red" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para editar comentario */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Comentario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="comment">
            <Form.Label>Comentario</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveComment}>
            Guardar Comentario
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CollectionComics;
