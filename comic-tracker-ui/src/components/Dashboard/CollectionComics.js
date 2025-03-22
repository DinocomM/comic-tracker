// src/components/Dashboard/CollectionComics.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import ComicService from '../../services/ComicService';
import CollectionService from '../../services/CollectionService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faPlusCircle, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

const CollectionComics = () => {
  const { id } = useParams(); // ID de la colección actual
  const [currentCollection, setCurrentCollection] = useState(null);
  const [hierarchy, setHierarchy] = useState([]); // Array de objetos: { _id, name } para breadcrumb
  const [subcollections, setSubcollections] = useState([]);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState(null);

  // Estado para el modal de crear/editar subcolección
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // "create" o "edit"
  const [newSub, setNewSub] = useState({ name: '', comment: '', rating: 0, parent: null });

  // Estado para el modal de confirmar marcar como leídos/no leídos
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markAction, setMarkAction] = useState({ markAsRead: null });

  // Estado para ordenamiento (para subcolecciones y cómics)
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Función para ordenar items según sortConfig
  const sortItems = (items) => {
    if (!sortConfig.key) return items;
    return [...items].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'name') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      } else if (sortConfig.key === 'rating') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (sortConfig.key === 'isRead' || sortConfig.key === 'allRead') {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // Definir handleCloseModal para cerrar el modal de creación/edición
  const handleCloseModal = () => setShowModal(false);

  // Obtener la colección actual
  const fetchCurrentCollection = async () => {
    try {
      const response = await CollectionService.getCollection(id);
      setCurrentCollection(response.data);
      console.log("Colección actual:", response.data);
    } catch (err) {
      setError('Error al cargar la colección');
    }
  };

  // Construir la jerarquía recursivamente (retorna array de objetos { _id, name })
  const buildHierarchy = async (col) => {
    let chain = [];
    let current = col;
    while (current && current.parent) {
      try {
        const res = await CollectionService.getCollection(current.parent);
        current = res.data;
        chain.unshift({ _id: current._id, name: current.name });
      } catch (err) {
        break;
      }
    }
    return chain;
  };

  // Obtener subcolecciones: usar getSubcollections con parent=id
  const fetchSubcollections = async () => {
    try {
      const response = await CollectionService.getSubcollections(id);
      setSubcollections(response.data);
    } catch (err) {
      setError('Error al cargar subcolecciones');
    }
  };

  // Obtener cómics asociados a la colección actual
  const fetchComics = async () => {
    try {
      const response = await ComicService.getComicsByCollection(id);
      setComics(response.data);
    } catch (err) {
      setError('Error al cargar cómics');
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await fetchCurrentCollection();
    await fetchSubcollections();
    await fetchComics();
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  useEffect(() => {
    const getHierarchy = async () => {
      if (currentCollection) {
        const chain = await buildHierarchy(currentCollection);
        setHierarchy(chain);
      }
    };
    getHierarchy();
  }, [currentCollection]);

  const filterItems = (items) =>
    items.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
  const filteredSub = filterItems(subcollections);
  const filteredComics = filterItems(comics);

  const sortedSub = sortItems(filteredSub);
  const sortedComics = sortItems(filteredComics);

  // Función para alternar el estado "leído" de un cómic
  const handleToggleRead = async (comic) => {
    try {
      await ComicService.updateComic(comic._id, { isRead: !comic.isRead });
      fetchComics();
    } catch (err) {
      setError("Error al actualizar el estado de lectura");
    }
  };

  // Función para alternar el estado "leído" de una subcolección
  const handleToggleSubRead = async (sub) => {
    try {
      await CollectionService.markCollectionReadStatus(sub._id, !sub.allRead);
      fetchSubcollections();
    } catch (err) {
      setError("Error al actualizar el estado de lectura de la subcolección");
    }
  };

  // Actualización inline del rating
  const handleRatingUpdate = async (item, newRating, isComic = true) => {
    try {
      if (isComic) {
        await ComicService.updateComic(item._id, { rating: newRating });
      } else {
        await CollectionService.updateCollection(item._id, { rating: newRating });
      }
      fetchAll();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al actualizar la valoración' });
    }
  };

  const handleDeleteComic = async (comicId) => {
    try {
      await ComicService.deleteComic(comicId);
      fetchAll();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al eliminar el cómic' });
    }
  };

  const handleDeleteSub = async (subId) => {
    try {
      await CollectionService.deleteCollection(subId);
      fetchAll();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al eliminar la subcolección' });
    }
  };

  // Definir handleShowModal para crear/editar subcolecciones
  const handleShowModal = (type, collection = { id: '', name: '', comment: '', rating: 0, parent: null }) => {
    setModalType(type);
    if (type === 'edit') {
      setCurrentCollection(collection);
    } else {
      setNewSub({ name: '', comment: '', rating: 0, parent: currentCollection ? currentCollection._id : id });
    }
    setShowModal(true);
  };

  // Definir handleSaveCollection para el modal de creación/edición
  const handleSaveCollection = async () => {
    if (modalType === 'create') {
      try {
        await CollectionService.createCollection(newSub);
        setMessage({ type: 'success', text: 'Subcolección creada correctamente' });
        setShowModal(false);
        fetchSubcollections();
      } catch (err) {
        setMessage({ type: 'danger', text: 'Error al crear la subcolección' });
      }
    } else {
      try {
        await CollectionService.updateCollection(currentCollection.id, {
          name: currentCollection.name,
          comment: currentCollection.comment,
          rating: currentCollection.rating,
          parent: currentCollection.parent,
        });
        setMessage({ type: 'success', text: 'Subcolección actualizada correctamente' });
        setShowModal(false);
        fetchSubcollections();
      } catch (err) {
        setMessage({ type: 'danger', text: 'Error al actualizar la subcolección' });
      }
    }
  };

  // Para marcar todos los cómics de la colección actual como leídos o no leídos
  const handleMarkCollection = (markAsRead) => {
    setMarkAction({ markAsRead });
    setShowMarkModal(true);
  };

  const handleConfirmMark = async () => {
    try {
      await CollectionService.markCollectionReadStatus(id, markAction.markAsRead);
      setMessage({
        type: 'success',
        text: `Todos los cómics se han marcado como ${markAction.markAsRead ? 'leídos' : 'no leídos'}.`
      });
      setShowMarkModal(false);
      fetchComics();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error al actualizar el estado de lectura de los cómics.' });
    }
  };

  return (
    <Container className="mt-4">
      {/* Breadcrumb */}
      <h2>
        Elementos de la Colección: {currentCollection ? currentCollection.name : 'Cargando...'}
      </h2>
      {currentCollection && (
        <h6>
          <Link to="/collections">Main</Link> {' > '}
          {hierarchy.map((item, index) => (
            <span key={index}>
              <Link to={`/collections/${item._id}/comics`}>{item.name}</Link>
              {' > '}
            </span>
          ))}
          <Link to={`/collections/${currentCollection._id}/comics`}>{currentCollection.name}</Link>
        </h6>
      )}
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <Form.Control
        type="text"
        placeholder="Filtrar por nombre..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-3"
      />

      {/* Botones para acciones generales */}
      <div className="mb-3">
        <Button variant="primary" onClick={() => handleShowModal('create')} className="me-2">
          <FontAwesomeIcon icon={faPlusCircle} /> Agregar Subcolección
        </Button>
        <Button variant="secondary" onClick={() => handleMarkCollection(true)} className="me-2">
          Marcar como Leídos
        </Button>
        <Button variant="secondary" onClick={() => handleMarkCollection(false)}>
          Marcar como No Leídos
        </Button>
      </div>

      {/* Tabla de Subcolecciones */}
      {sortedSub.length > 0 && (
        <>
          <h4>Subcolecciones</h4>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Nombre {sortConfig.key==='name' ? (sortConfig.direction==='asc' ? '▲' : '▼') : ''}
                </th>
                <th>Comentario</th>
                <th onClick={() => handleSort('allRead')} style={{ cursor: 'pointer' }}>
                  Leído {sortConfig.key==='allRead' ? (sortConfig.direction==='asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('rating')} style={{ cursor: 'pointer' }}>
                  Valoración {sortConfig.key==='rating' ? (sortConfig.direction==='asc' ? '▲' : '▼') : ''}
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedSub.map((sub) => (
                <tr key={sub._id} style={{ backgroundColor: '#f2f2f2' }}>
                  <td>{sub.name}</td>
                  <td>{sub.comment || '-'}</td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleToggleSubRead(sub)}
                      title="Alternar leído"
                    >
                      {sub.allRead ? (
                        <FontAwesomeIcon icon={faCheckCircle} color="green" />
                      ) : (
                        <FontAwesomeIcon icon={faTimesCircle} color="gray" />
                      )}
                    </Button>
                  </td>
                  <td>
                    {[1,2,3,4,5].map((star) => (
                      <span
                        key={star}
                        onClick={() => handleRatingUpdate(sub, star, false)}
                        style={{ cursor: 'pointer', marginRight: 3 }}
                        title={`Marcar ${star} estrellas`}
                      >
                        <FontAwesomeIcon
                          icon={star <= (sub.rating || 0) ? faStarSolid : faStarRegular}
                          color="gold"
                        />
                      </span>
                    ))}
                  </td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      as={Link}
                      to={`/collections/${sub._id}/comics`}
                      title="Ver Elementos"
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() =>
                        handleShowModal('edit', {
                          id: sub._id,
                          name: sub.name,
                          comment: sub.comment || '',
                          rating: sub.rating || 0,
                          parent: sub.parent,
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
                      onClick={() => handleDeleteSub(sub._id)}
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
        </>
      )}

      {/* Tabla de Cómics */}
      {sortedComics.length > 0 && (
        <>
          <h4>Cómics</h4>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Nombre {sortConfig.key==='name' ? (sortConfig.direction==='asc' ? '▲' : '▼') : ''}
                </th>
                <th>Ruta</th>
                <th onClick={() => handleSort('isRead')} style={{ cursor: 'pointer' }}>
                  Leído {sortConfig.key==='isRead' ? (sortConfig.direction==='asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('rating')} style={{ cursor: 'pointer' }}>
                  Valoración {sortConfig.key==='rating' ? (sortConfig.direction==='asc' ? '▲' : '▼') : ''}
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedComics.map((comic) => (
                <tr key={comic._id}>
                  <td>{comic.name}</td>
                  <td>{comic.path}</td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleToggleRead(comic)}
                      title="Alternar leído"
                    >
                      {comic.isRead ? (
                        <FontAwesomeIcon icon={faCheckCircle} color="green" />
                      ) : (
                        <FontAwesomeIcon icon={faTimesCircle} color="gray" />
                      )}
                    </Button>
                  </td>
                  <td>
                    {[1,2,3,4,5].map((star) => (
                      <span
                        key={star}
                        onClick={() => handleRatingUpdate(comic, star, true)}
                        style={{ cursor: 'pointer', marginRight: 3 }}
                        title={`Marcar ${star} estrellas`}
                      >
                        <FontAwesomeIcon
                          icon={star <= (comic.rating || 0) ? faStarSolid : faStarRegular}
                          color="gold"
                        />
                      </span>
                    ))}
                  </td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      as={Link}
                      to={`/comics/${comic._id}`}
                      title="Ver Detalle"
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => alert('Implementar edición de cómic')}
                      title="Editar"
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleDeleteComic(comic._id)}
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
        </>
      )}

      {/* Modal para crear/editar colección (para colecciones principales y subcolecciones) */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'create'
              ? currentCollection && currentCollection.parent
                ? 'Crear Subcolección'
                : 'Crear Colección'
              : currentCollection && currentCollection.parent
              ? 'Editar Subcolección'
              : 'Editar Colección'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="collectionName">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el nombre de la colección"
              value={currentCollection ? currentCollection.name : ''}
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
              value={currentCollection ? currentCollection.comment : ''}
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
            {markAction.markAsRead ? 'Marcar como leídos' : 'Marcar como no leídos'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de que deseas marcar todos los cómics de la colección{' '}
            <strong>{currentCollection ? currentCollection.name : ''}</strong> como{' '}
            {markAction.markAsRead ? 'leídos' : 'no leídos'}?
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

export default CollectionComics;



// // src/components/Dashboard/CollectionComics.js
// import React, { useState, useEffect } from 'react';
// import { Container, Table, Button, Form, Modal, Alert } from 'react-bootstrap';
// import { useParams, Link } from 'react-router-dom';
// import ComicService from '../../services/ComicService';
// import CollectionService from '../../services/CollectionService';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEye, faEdit, faTrash, faPlusCircle, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
// import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
// import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

// const CollectionComics = () => {
//   const { id } = useParams(); // ID de la colección actual
//   const [currentCollection, setCurrentCollection] = useState(null);
//   const [hierarchy, setHierarchy] = useState([]); // Array de nombres para el breadcrumb
//   const [subcollections, setSubcollections] = useState([]);
//   const [comics, setComics] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('');
//   const [message, setMessage] = useState(null);

//   // Estado para el modal de crear/editar subcolección
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState('create'); // "create" o "edit"
//   const [newSub, setNewSub] = useState({ name: '', comment: '', rating: 0, parent: null });

//   // Estado para el modal de confirmar marcar como leídos/no leídos
//   const [showMarkModal, setShowMarkModal] = useState(false);
//   const [markAction, setMarkAction] = useState({ markAsRead: null });

//   // Cerrar modal de creación/edición
//   const handleCloseModal = () => setShowModal(false);

//   // Obtener la colección actual
//   const fetchCurrentCollection = async () => {
//     try {
//       const response = await CollectionService.getCollection(id);
//       setCurrentCollection(response.data);
//       console.log("Colección actual:", response.data);
//     } catch (err) {
//       setError('Error al cargar la colección');
//     }
//   };

//   // Construir la jerarquía recursivamente
//   const buildHierarchy = async (col) => {
//     let chain = [];
//     let current = col;
//     while (current && current.parent) {
//       try {
//         const res = await CollectionService.getCollection(current.parent);
//         current = res.data;
//         chain.unshift(current.name);
//       } catch (err) {
//         break;
//       }
//     }
//     return chain;
//   };

//   // Obtener subcolecciones: usar getSubcollections con parent=id
//   const fetchSubcollections = async () => {
//     try {
//       const response = await CollectionService.getSubcollections(id);
//       setSubcollections(response.data);
//     } catch (err) {
//       setError('Error al cargar subcolecciones');
//     }
//   };

//   // Obtener cómics asociados a la colección actual
//   const fetchComics = async () => {
//     try {
//       const response = await ComicService.getComicsByCollection(id);
//       setComics(response.data);
//     } catch (err) {
//       setError('Error al cargar cómics');
//     }
//   };

//   const fetchAll = async () => {
//     setLoading(true);
//     await fetchCurrentCollection();
//     await fetchSubcollections();
//     await fetchComics();
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchAll();
//   }, [id]);

//   useEffect(() => {
//     const getHierarchy = async () => {
//       if (currentCollection) {
//         const chain = await buildHierarchy(currentCollection);
//         setHierarchy(chain);
//       }
//     };
//     getHierarchy();
//   }, [currentCollection]);

//   const filterItems = (items) =>
//     items.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
//   const filteredSub = filterItems(subcollections);
//   const filteredComics = filterItems(comics);

//   // Función para alternar el estado "leído" de un cómic
//   const handleToggleRead = async (comic) => {
//     try {
//       await ComicService.updateComic(comic._id, { isRead: !comic.isRead });
//       fetchComics();
//     } catch (err) {
//       setError("Error al actualizar el estado de lectura");
//     }
//   };

//   // Función para alternar el estado "leído" de una subcolección
//   const handleToggleSubRead = async (sub) => {
//     try {
//       await CollectionService.markCollectionReadStatus(sub._id, !sub.allRead);
//       fetchSubcollections();
//     } catch (err) {
//       setError("Error al actualizar el estado de lectura de la subcolección");
//     }
//   };

//   // Actualización inline del rating
//   const handleRatingUpdate = async (item, newRating, isComic = true) => {
//     try {
//       if (isComic) {
//         await ComicService.updateComic(item._id, { rating: newRating });
//       } else {
//         await CollectionService.updateCollection(item._id, { rating: newRating });
//       }
//       fetchAll();
//     } catch (err) {
//       setMessage({ type: 'danger', text: 'Error al actualizar la valoración' });
//     }
//   };

//   const handleDeleteComic = async (comicId) => {
//     try {
//       await ComicService.deleteComic(comicId);
//       fetchAll();
//     } catch (err) {
//       setMessage({ type: 'danger', text: 'Error al eliminar el cómic' });
//     }
//   };

//   const handleDeleteSub = async (subId) => {
//     try {
//       await CollectionService.deleteCollection(subId);
//       fetchAll();
//     } catch (err) {
//       setMessage({ type: 'danger', text: 'Error al eliminar la subcolección' });
//     }
//   };

//   // Definir handleShowModal para crear/editar subcolecciones
//   const handleShowModal = (type, collection = { id: '', name: '', comment: '', rating: 0, parent: null }) => {
//     setModalType(type);
//     if (type === 'edit') {
//       setCurrentCollection(collection);
//     } else {
//       setNewSub({ name: '', comment: '', rating: 0, parent: currentCollection ? currentCollection._id : id });
//     }
//     setShowModal(true);
//   };

//   // Definir handleSaveCollection para el modal de creación/edición
//   const handleSaveCollection = async () => {
//     if (modalType === 'create') {
//       try {
//         await CollectionService.createCollection(newSub);
//         setMessage({ type: 'success', text: 'Subcolección creada correctamente' });
//         setShowModal(false);
//         fetchSubcollections();
//       } catch (err) {
//         setMessage({ type: 'danger', text: 'Error al crear la subcolección' });
//       }
//     } else {
//       try {
//         await CollectionService.updateCollection(currentCollection.id, {
//           name: currentCollection.name,
//           comment: currentCollection.comment,
//           rating: currentCollection.rating,
//           parent: currentCollection.parent,
//         });
//         setMessage({ type: 'success', text: 'Subcolección actualizada correctamente' });
//         setShowModal(false);
//         fetchSubcollections();
//       } catch (err) {
//         setMessage({ type: 'danger', text: 'Error al actualizar la subcolección' });
//       }
//     }
//   };

//   // Para marcar todos los cómics de la colección actual como leídos o no leídos
//   const handleMarkCollection = (markAsRead) => {
//     setMarkAction({ markAsRead });
//     setShowMarkModal(true);
//   };

//   const handleConfirmMark = async () => {
//     try {
//       await CollectionService.markCollectionReadStatus(id, markAction.markAsRead);
//       setMessage({
//         type: 'success',
//         text: `Todos los cómics se han marcado como ${markAction.markAsRead ? 'leídos' : 'no leídos'}.`
//       });
//       setShowMarkModal(false);
//       fetchComics();
//     } catch (err) {
//       setMessage({ type: 'danger', text: 'Error al actualizar el estado de lectura de los cómics.' });
//     }
//   };

//   return (
//     <Container className="mt-4">
//       {/* Encabezado con título y breadcrumb */}
//       <h2>
//         Elementos de la Colección: {currentCollection ? currentCollection.name : 'Cargando...'}
//       </h2>
//       {currentCollection && (
//         <h5>
//           {hierarchy.length > 0 ? hierarchy.join(' > ') + ' > ' : ''}{currentCollection.name}
//         </h5>
//       )}
//       {message && <Alert variant={message.type}>{message.text}</Alert>}
//       <Form.Control
//         type="text"
//         placeholder="Filtrar por nombre..."
//         value={filter}
//         onChange={(e) => setFilter(e.target.value)}
//         className="mb-3"
//       />

//       {/* Botones para acciones generales */}
//       <div className="mb-3">
//         <Button variant="primary" onClick={() => handleShowModal('create')} className="me-2">
//           <FontAwesomeIcon icon={faPlusCircle} /> Agregar Subcolección
//         </Button>
//         <Button variant="secondary" onClick={() => handleMarkCollection(true)} className="me-2">
//           Marcar como Leídos
//         </Button>
//         <Button variant="secondary" onClick={() => handleMarkCollection(false)}>
//           Marcar como No Leídos
//         </Button>
//       </div>

//       {/* Tabla de Subcolecciones */}
//       {filteredSub.length > 0 && (
//         <>
//           <h4>Subcolecciones</h4>
//           <Table striped bordered hover responsive>
//             <thead>
//               <tr>
//                 <th>Nombre</th>
//                 <th>Comentario</th>
//                 <th>Leído</th>
//                 <th>Valoración</th>
//                 <th>Acciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredSub.map((sub) => (
//                 <tr key={sub._id} style={{ backgroundColor: '#f2f2f2' }}>
//                   <td>{sub.name}</td>
//                   <td>{sub.comment || '-'}</td>
//                   <td>
//                     <Button
//                       variant="link"
//                       size="sm"
//                       onClick={() => handleToggleSubRead(sub)}
//                       title="Alternar leído"
//                     >
//                       {sub.allRead ? (
//                         <FontAwesomeIcon icon={faCheckCircle} color="green" />
//                       ) : (
//                         <FontAwesomeIcon icon={faTimesCircle} color="gray" />
//                       )}
//                     </Button>
//                   </td>
//                   <td>
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <span
//                         key={star}
//                         onClick={() => handleRatingUpdate(sub, star, false)}
//                         style={{ cursor: 'pointer', marginRight: 3 }}
//                         title={`Marcar ${star} estrellas`}
//                       >
//                         <FontAwesomeIcon
//                           icon={star <= (sub.rating || 0) ? faStarSolid : faStarRegular}
//                           color="gold"
//                         />
//                       </span>
//                     ))}
//                   </td>
//                   <td>
//                     <Button
//                       variant="link"
//                       size="sm"
//                       as={Link}
//                       to={`/collections/${sub._id}/comics`}
//                       title="Ver Elementos"
//                       className="me-2"
//                     >
//                       <FontAwesomeIcon icon={faEye} />
//                     </Button>
//                     <Button
//                       variant="link"
//                       size="sm"
//                       onClick={() =>
//                         handleShowModal('edit', {
//                           id: sub._id,
//                           name: sub.name,
//                           comment: sub.comment || '',
//                           rating: sub.rating || 0,
//                           parent: sub.parent,
//                         })
//                       }
//                       title="Editar"
//                       className="me-2"
//                     >
//                       <FontAwesomeIcon icon={faEdit} />
//                     </Button>
//                     <Button
//                       variant="link"
//                       size="sm"
//                       onClick={() => handleDeleteSub(sub._id)}
//                       title="Eliminar"
//                       className="me-2"
//                     >
//                       <FontAwesomeIcon icon={faTrash} color="red" />
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </>
//       )}

//       {/* Tabla de Cómics */}
//       {filteredComics.length > 0 && (
//         <>
//           <h4>Cómics</h4>
//           <Table striped bordered hover responsive>
//             <thead>
//               <tr>
//                 <th>Nombre</th>
//                 <th>Ruta</th>
//                 <th>Leído</th>
//                 <th>Valoración</th>
//                 <th>Acciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredComics.map((comic) => (
//                 <tr key={comic._id}>
//                   <td>{comic.name}</td>
//                   <td>{comic.path}</td>
//                   <td>
//                     <Button
//                       variant="link"
//                       size="sm"
//                       onClick={() => handleToggleRead(comic)}
//                       title="Alternar leído"
//                     >
//                       {comic.isRead ? (
//                         <FontAwesomeIcon icon={faCheckCircle} color="green" />
//                       ) : (
//                         <FontAwesomeIcon icon={faTimesCircle} color="gray" />
//                       )}
//                     </Button>
//                   </td>
//                   <td>
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <span
//                         key={star}
//                         onClick={() => handleRatingUpdate(comic, star, true)}
//                         style={{ cursor: 'pointer', marginRight: 3 }}
//                         title={`Marcar ${star} estrellas`}
//                       >
//                         <FontAwesomeIcon
//                           icon={star <= (comic.rating || 0) ? faStarSolid : faStarRegular}
//                           color="gold"
//                         />
//                       </span>
//                     ))}
//                   </td>
//                   <td>
//                     <Button
//                       variant="link"
//                       size="sm"
//                       as={Link}
//                       to={`/comics/${comic._id}`}
//                       title="Ver Detalle"
//                       className="me-2"
//                     >
//                       <FontAwesomeIcon icon={faEye} />
//                     </Button>
//                     <Button
//                       variant="link"
//                       size="sm"
//                       onClick={() => alert('Implementar edición de cómic')}
//                       title="Editar"
//                       className="me-2"
//                     >
//                       <FontAwesomeIcon icon={faEdit} />
//                     </Button>
//                     <Button
//                       variant="link"
//                       size="sm"
//                       onClick={() => handleDeleteComic(comic._id)}
//                       title="Eliminar"
//                       className="me-2"
//                     >
//                       <FontAwesomeIcon icon={faTrash} color="red" />
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </>
//       )}

//       {/* Modal para crear/editar colección (para colecciones principales y subcolecciones) */}
//       <Modal show={showModal} onHide={handleCloseModal}>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {modalType === 'create'
//               ? currentCollection && currentCollection.parent
//                 ? 'Crear Subcolección'
//                 : 'Crear Colección'
//               : currentCollection && currentCollection.parent
//               ? 'Editar Subcolección'
//               : 'Editar Colección'}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group controlId="collectionName">
//             <Form.Label>Nombre</Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="Ingresa el nombre de la colección"
//               value={currentCollection ? currentCollection.name : ''}
//               onChange={(e) =>
//                 setCurrentCollection({ ...currentCollection, name: e.target.value })
//               }
//             />
//           </Form.Group>
//           <Form.Group controlId="collectionComment" className="mt-3">
//             <Form.Label>Comentario</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               placeholder="Ingresa un comentario (opcional)"
//               value={currentCollection ? currentCollection.comment : ''}
//               onChange={(e) =>
//                 setCurrentCollection({ ...currentCollection, comment: e.target.value })
//               }
//             />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancelar
//           </Button>
//           <Button variant="primary" onClick={handleSaveCollection}>
//             Guardar
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Modal para confirmar marcar la colección como leídos/no leídos */}
//       <Modal show={showMarkModal} onHide={() => setShowMarkModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {markAction.markAsRead ? 'Marcar como leídos' : 'Marcar como no leídos'}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>
//             ¿Estás seguro de que deseas marcar todos los cómics de la colección{' '}
//             <strong>{currentCollection ? currentCollection.name : ''}</strong> como{' '}
//             {markAction.markAsRead ? 'leídos' : 'no leídos'}?
//           </p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowMarkModal(false)}>
//             Cancelar
//           </Button>
//           <Button variant="primary" onClick={handleConfirmMark}>
//             Confirmar
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default CollectionComics;
