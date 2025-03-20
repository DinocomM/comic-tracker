import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CollectionService from '../../services/CollectionService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

const CollectionManager = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal para editar colección (nombre y comentario)
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // "create" o "edit"
  const [currentCollection, setCurrentCollection] = useState({
    id: '',
    name: '',
    comment: '',
    rating: 0
  });

  // Modal para confirmar marcar la colección como leídos/no leídos
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedMarkAction, setSelectedMarkAction] = useState({ collection: null, markAsRead: null });

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const response = await CollectionService.getCollections();
      // Asumiremos que el backend ha sido modificado para incluir un campo "allRead"
      // que indique si todos los cómics de la colección están leídos.
      setCollections(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al obtener colecciones');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const filteredCollections = collections.filter((col) =>
    col.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sorted = [...collections].sort((a, b) => {
      if (a.name < b.name) return newOrder === 'asc' ? -1 : 1;
      if (a.name > b.name) return newOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setCollections(sorted);
  };

  const handleShowModal = (type, collection = { id: '', name: '', comment: '', rating: 0 }) => {
    setModalType(type);
    setCurrentCollection(collection);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCollection({ id: '', name: '', comment: '', rating: 0 });
  };

  const handleSaveCollection = async () => {
    try {
      if (modalType === 'create') {
        await CollectionService.createCollection({
          name: currentCollection.name,
          comment: currentCollection.comment,
          rating: currentCollection.rating || 0
        });
        setMessage({ type: 'success', text: 'Colección creada correctamente' });
      } else if (modalType === 'edit') {
        await CollectionService.updateCollection(currentCollection.id, {
          name: currentCollection.name,
          comment: currentCollection.comment
        });
        setMessage({ type: 'success', text: 'Colección actualizada correctamente' });
      }
      handleCloseModal();
      fetchCollections();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al guardar la colección' });
    }
  };

  // Actualización inline del rating de la colección
  const handleRatingUpdate = async (col, newRating) => {
    try {
      await CollectionService.updateCollection(col._id, { rating: newRating });
      fetchCollections();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al actualizar la valoración' });
    }
  };

  const handleDeleteCollection = async (id) => {
    const confirmDelete = window.confirm(
      'Si borras esta colección, se eliminarán también todos los cómics, valoraciones y comentarios asociados. ¿Estás seguro?'
    );
    if (!confirmDelete) return;
    try {
      await CollectionService.deleteCollection(id);
      setMessage({ type: 'success', text: 'Colección eliminada correctamente' });
      fetchCollections();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al eliminar la colección' });
    }
  };

  // Handler para marcar la colección (todos los cómics asociados)
  const handleMarkCollection = (collection) => {
    // Suponemos que el objeto "collection" tiene un campo "allRead" (boolean) que indica si todos los cómics están leídos.
    // Si no lo tiene, el backend debe incluirlo en getCollections mediante un aggregate.
    const markAsRead = !collection.allRead;
    setSelectedMarkAction({ collection, markAsRead });
    setShowMarkModal(true);
  };

  const handleConfirmMark = async () => {
    try {
      await CollectionService.markCollectionReadStatus(
        selectedMarkAction.collection._id,
        selectedMarkAction.markAsRead
      );
      setMessage({
        type: 'success',
        text: `Todos los cómics de la colección se han marcado como ${selectedMarkAction.markAsRead ? 'leídos' : 'no leídos'}.`
      });
      setShowMarkModal(false);
      fetchCollections();
    } catch (error) {
      setMessage({ type: 'danger', text: 'Error al actualizar el estado de lectura de la colección.' });
    }
  };

  return (
    <Container className="mt-4">
      <h2>Gestión de Colecciones</h2>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <Form.Control
        type="text"
        placeholder="Filtrar por nombre..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-3"
      />
      <Button variant="primary" onClick={() => handleShowModal('create')}>
        Crear Colección
      </Button>
      {loading ? (
        <p>Cargando colecciones...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th onClick={handleSort} style={{ cursor: 'pointer' }}>
                Nombre {sortOrder === 'asc' ? '▲' : '▼'}
              </th>
              <th>Comentario</th>
              <th>Valoración</th>
              <th>Estado de Lectura</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCollections.map((col) => (
              <tr key={col._id}>
                <td>{col.name}</td>
                <td>{col.comment || '-'}</td>
                <td>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => handleRatingUpdate(col, star)}
                      style={{ cursor: 'pointer', marginRight: 3 }}
                      title={`Marcar ${star} estrella${star > 1 ? 's' : ''}`}
                    >
                      <FontAwesomeIcon
                        icon={star <= (col.rating || 0) ? faStarSolid : faStarRegular}
                        color="gold"
                      />
                    </span>
                  ))}
                </td>
                <td>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => handleMarkCollection(col)}
                    title={col.allRead ? 'Marcar como no leídos' : 'Marcar como leídos'}
                  >
                    {col.allRead ? (
                      <FontAwesomeIcon icon={faCheckCircle} color="green" />
                    ) : (
                      <FontAwesomeIcon icon={faTimesCircle} color="gray" />
                    )}
                  </Button>
                </td>
                <td>
                  <Button
                    variant="link"
                    size="sm"
                    as={Link}
                    to={`/collections/${col._id}/comics`}
                    title="Ver Cómics"
                    className="me-2"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() =>
                      handleShowModal('edit', {
                        id: col._id,
                        name: col.name,
                        comment: col.comment || '',
                        rating: col.rating || 0
                      })
                    }
                    title="Editar"
                    className="me-2"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => handleDeleteCollection(col._id)}
                    title="Eliminar"
                    className="me-2"
                  >
                    <FontAwesomeIcon icon={faTrash} color="red" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal para crear o editar colección (excluye rating, que se actualiza inline) */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'create' ? 'Crear Colección' : 'Editar Colección'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="collectionName">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el nombre de la colección"
              value={currentCollection.name}
              onChange={(e) =>
                setCurrentCollection({ ...currentCollection, name: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="collectionComment" className="mt-3">
            <Form.Label>Comentario</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingresa un comentario (opcional)"
              value={currentCollection.comment}
              onChange={(e) =>
                setCurrentCollection({ ...currentCollection, comment: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveCollection}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para confirmar marcar la colección como leídos/no leídos */}
      <Modal show={showMarkModal} onHide={() => setShowMarkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedMarkAction.markAsRead ? 'Marcar como leídos' : 'Marcar como no leídos'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de que deseas marcar todos los cómics de la colección{' '}
            <strong>{selectedMarkAction.collection?.name}</strong> como{' '}
            {selectedMarkAction.markAsRead ? 'leídos' : 'no leídos'}?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMarkModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmMark}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CollectionManager;
