// src/components/FolderScanner.js
import React, { useState } from 'react';
import { Container, Form, Button, ListGroup, Alert, Modal } from 'react-bootstrap';
import CollectionService from '../services/CollectionService';

const FolderScanner = () => {
  const [filesInfo, setFilesInfo] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [collectionName, setCollectionName] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Procesa la selección de carpeta y extrae la estructura de archivos
  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files);
    const comicsData = files.map(file => {
      const relativePath = file.webkitRelativePath; // Ej.: "My Comics/DC/Batman/The Batman #1.pdf"
      const pathParts = relativePath.split('/');
      const name = file.name.replace(/\.[^/.]+$/, '');
      const directories = pathParts.slice(0, -1); // Carpeta(s) donde se encuentra el archivo
      return {
        name,
        path: relativePath,
        directories,
        isRead: false,
        readAt: null
      };
    });
    setFilesInfo(comicsData);
  };

  // Función recursiva para construir la estructura jerárquica
  const buildStructure = () => {
    // La colección principal se crea con el nombre ingresado (ignorando el nombre de la carpeta raíz)
    const mainCollection = {
      name: collectionName,
      comics: [],
      subcollections: []
    };

    // Función auxiliar que busca o crea una subcolección dentro de parentNode
    const findOrCreateSubcollection = (parentNode, folderName) => {
      let node = parentNode.subcollections.find(sc => sc.name === folderName);
      if (!node) {
        node = { name: folderName, comics: [], subcollections: [] };
        parentNode.subcollections.push(node);
      }
      return node;
    };

    // Iterar sobre cada archivo
    filesInfo.forEach(file => {
      // Si el archivo no tiene directorios, se asigna a la colección principal
      if (file.directories.length === 0) {
        mainCollection.comics.push({
          name: file.name,
          path: file.path,
          isRead: file.isRead,
          readAt: file.readAt
        });
      } else {
        // Si hay directorios, se ignora el primer nivel (que es la carpeta raíz) y se usan los siguientes niveles
        const subDirs = file.directories.length > 1 ? file.directories.slice(1) : [];
        let currentNode = mainCollection;
        subDirs.forEach(folderName => {
          currentNode = findOrCreateSubcollection(currentNode, folderName);
        });
        // Si no hay subdirectorios después de eliminar el primero, se asigna el comic directamente a la colección principal
        if (subDirs.length === 0) {
          mainCollection.comics.push({
            name: file.name,
            path: file.path,
            isRead: file.isRead,
            readAt: file.readAt
          });
        } else {
          // Una vez recorridas las carpetas (desde el segundo nivel), se añade el comic al nodo final
          currentNode.comics.push({
            name: file.name,
            path: file.path,
            isRead: file.isRead,
            readAt: file.readAt
          });
        }
      }
    });
    return mainCollection;
  };

  // Realiza la subida de la estructura jerárquica
  const performUpload = async (mode) => {
    try {
      const structure = buildStructure();
      const payload = { collectionStructure: structure, mode };
      console.log("Enviando payload (mode: " + mode + "):", JSON.stringify(payload).length, "bytes");
      const response = await CollectionService.uploadCollectionStructure(payload);
      setUploadStatus({ type: 'success', message: response.data.message });
      console.log(response.data);
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Error al subir la estructura.' });
      console.error(error);
    }
  };

  // Verifica si la colección ya existe para el usuario
  const checkCollectionExists = async () => {
    try {
      const response = await CollectionService.getCollections();
      const collections = response.data;
      return collections.some(
        (col) => col.name.trim().toLowerCase() === collectionName.trim().toLowerCase()
      );
    } catch (error) {
      console.error("Error al verificar la existencia de la colección:", error);
      return false;
    }
  };

  // Maneja la subida de la estructura
  const handleUpload = async () => {
    if (!collectionName.trim()) {
      setUploadStatus({ type: 'danger', message: 'Debes ingresar un nombre para la colección.' });
      return;
    }
    const exists = await checkCollectionExists();
    if (exists) {
      setShowModal(true);
    } else {
      await performUpload('create');
    }
  };

  // Maneja la opción seleccionada en el modal
  const handleModalOption = async (option) => {
    setShowModal(false);
    if (option === 'cancel') {
      setUploadStatus({ type: 'info', message: 'Carga cancelada por el usuario.' });
      return;
    }
    if (option === 'append') {
      await performUpload('append');
    }
    if (option === 'overwrite') {
      await performUpload('overwrite');
    }
  };

  return (
    <Container className="mt-4">
      <h2>Crear Colección por Escaneo de Carpeta</h2>
      <Form.Group controlId="collectionName">
        <Form.Label>Nombre de la Colección Principal</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ingresa el nombre de la colección principal"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="folderInput" className="mt-3">
        <Form.Label>Selecciona una carpeta (la estructura interna se crearán como subcolecciones y cómics):</Form.Label>
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
        <Alert variant={
          uploadStatus.type === 'success' ? 'success' : 
          (uploadStatus.type === 'error' ? 'danger' : 'info')
        } className="mt-3">
          {uploadStatus.message}
        </Alert>
      )}

      <Modal show={showModal} onHide={() => handleModalOption('cancel')}>
        <Modal.Header closeButton>
          <Modal.Title>La colección ya existe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>La colección <strong>{collectionName}</strong> ya existe.</p>
          <p>¿Qué deseas hacer?</p>
          <ul>
            <li><strong>Cancelar:</strong> No subir ningún cómic.</li>
            <li><strong>Agregar:</strong> Añadir los cómics a la colección existente.</li>
            <li><strong>Sobrescribir:</strong> Reemplazar completamente la colección existente por la nueva estructura.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleModalOption('cancel')}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => handleModalOption('append')}>
            Agregar cómics
          </Button>
          <Button variant="danger" onClick={() => handleModalOption('overwrite')}>
            Sobrescribir colección
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FolderScanner;


// // src/components/FolderScanner.js
// import React, { useState } from 'react';
// import { Container, Form, Button, ListGroup, Alert, Modal } from 'react-bootstrap';
// import CollectionService from '../services/CollectionService';

// const FolderScanner = () => {
//   const [filesInfo, setFilesInfo] = useState([]);
//   const [uploadStatus, setUploadStatus] = useState(null);
//   const [collectionName, setCollectionName] = useState('');
//   const [showModal, setShowModal] = useState(false);

//   // Procesa la selección de carpeta y extrae la estructura de archivos
//   const handleFolderSelect = (e) => {
//     const files = Array.from(e.target.files);
//     const comicsData = files.map(file => {
//       const relativePath = file.webkitRelativePath; // Ej.: "DC/Batman/The Batman #1.pdf"
//       const pathParts = relativePath.split('/');
//       const name = file.name.replace(/\.[^/.]+$/, '');
//       const directories = pathParts.slice(0, -1); // Carpeta(s) donde se encuentra el archivo
//       return {
//         name,
//         path: relativePath,
//         directories,
//         isRead: false,
//         readAt: null
//       };
//     });
//     setFilesInfo(comicsData);
//   };

//   // Función recursiva para construir la estructura jerárquica
//   const buildStructure = () => {
//     // La colección principal se crea con el nombre ingresado
//     const mainCollection = {
//       name: collectionName,
//       comics: [],
//       subcollections: []
//     };

//     // Función auxiliar que busca o crea una subcolección dentro de parentNode
//     const findOrCreateSubcollection = (parentNode, folderName) => {
//       let node = parentNode.subcollections.find(sc => sc.name === folderName);
//       if (!node) {
//         node = { name: folderName, comics: [], subcollections: [] };
//         parentNode.subcollections.push(node);
//       }
//       return node;
//     };

//     // Iterar sobre cada archivo
//     filesInfo.forEach(file => {
//       if (file.directories.length === 0) {
//         // Si no hay carpetas, el archivo va a la colección principal
//         mainCollection.comics.push({
//           name: file.name,
//           path: file.path,
//           isRead: file.isRead,
//           readAt: file.readAt
//         });
//       } else {
//         // Si hay carpetas, se navega por la jerarquía
//         let currentNode = mainCollection;
//         file.directories.forEach(folderName => {
//           currentNode = findOrCreateSubcollection(currentNode, folderName);
//         });
//         // Una vez recorridas las carpetas, se añade el comic al nodo final
//         currentNode.comics.push({
//           name: file.name,
//           path: file.path,
//           isRead: file.isRead,
//           readAt: file.readAt
//         });
//       }
//     });
//     return mainCollection;
//   };

//   // Realiza la subida de la estructura jerárquica
//   const performUpload = async (mode) => {
//     try {
//       const structure = buildStructure();
//       const payload = { collectionStructure: structure, mode };
//       console.log("Enviando payload (mode: " + mode + "):", JSON.stringify(payload).length, "bytes");
//       const response = await CollectionService.uploadCollectionStructure(payload);
//       setUploadStatus({ type: 'success', message: response.data.message });
//       console.log(response.data);
//     } catch (error) {
//       setUploadStatus({ type: 'error', message: 'Error al subir la estructura.' });
//       console.error(error);
//     }
//   };

//   // Verifica si la colección ya existe para el usuario
//   const checkCollectionExists = async () => {
//     try {
//       const response = await CollectionService.getCollections();
//       const collections = response.data;
//       return collections.some(
//         (col) => col.name.trim().toLowerCase() === collectionName.trim().toLowerCase()
//       );
//     } catch (error) {
//       console.error("Error al verificar la existencia de la colección:", error);
//       return false;
//     }
//   };

//   // Maneja la subida de la estructura
//   const handleUpload = async () => {
//     if (!collectionName.trim()) {
//       setUploadStatus({ type: 'danger', message: 'Debes ingresar un nombre para la colección.' });
//       return;
//     }
//     const exists = await checkCollectionExists();
//     if (exists) {
//       setShowModal(true);
//     } else {
//       await performUpload('create');
//     }
//   };

//   // Maneja la opción seleccionada en el modal
//   const handleModalOption = async (option) => {
//     setShowModal(false);
//     if (option === 'cancel') {
//       setUploadStatus({ type: 'info', message: 'Carga cancelada por el usuario.' });
//       return;
//     }
//     if (option === 'append') {
//       await performUpload('append');
//     }
//     if (option === 'overwrite') {
//       await performUpload('overwrite');
//     }
//   };

//   return (
//     <Container className="mt-4">
//       <h2>Crear Colección por Escaneo de Carpeta</h2>
//       <Form.Group controlId="collectionName">
//         <Form.Label>Nombre de la Colección</Form.Label>
//         <Form.Control
//           type="text"
//           placeholder="Ingresa el nombre de la colección"
//           value={collectionName}
//           onChange={(e) => setCollectionName(e.target.value)}
//         />
//       </Form.Group>

//       <Form.Group controlId="folderInput" className="mt-3">
//         <Form.Label>Selecciona una carpeta:</Form.Label>
//         <Form.Control
//           type="file"
//           webkitdirectory="true"
//           multiple
//           onChange={handleFolderSelect}
//         />
//       </Form.Group>
      
//       {filesInfo.length > 0 && (
//         <>
//           <h4 className="mt-3">Archivos detectados:</h4>
//           <ListGroup>
//             {filesInfo.map((comic, index) => (
//               <ListGroup.Item key={index}>
//                 <strong>{comic.name}</strong> - {comic.path}
//               </ListGroup.Item>
//             ))}
//           </ListGroup>
//           <Button variant="primary" className="mt-3" onClick={handleUpload}>
//             Subir Estructura
//           </Button>
//         </>
//       )}

//       {uploadStatus && (
//         <Alert variant={
//           uploadStatus.type === 'success' ? 'success' : 
//           (uploadStatus.type === 'error' ? 'danger' : 'info')
//         } className="mt-3">
//           {uploadStatus.message}
//         </Alert>
//       )}

//       <Modal show={showModal} onHide={() => handleModalOption('cancel')}>
//         <Modal.Header closeButton>
//           <Modal.Title>La colección ya existe</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>La colección <strong>{collectionName}</strong> ya existe.</p>
//           <p>¿Qué deseas hacer?</p>
//           <ul>
//             <li><strong>Cancelar:</strong> No subir ningún cómic.</li>
//             <li><strong>Agregar:</strong> Añadir los cómics a la colección existente.</li>
//             <li><strong>Sobrescribir:</strong> Reemplazar completamente la colección existente por la nueva estructura.</li>
//           </ul>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => handleModalOption('cancel')}>
//             Cancelar
//           </Button>
//           <Button variant="primary" onClick={() => handleModalOption('append')}>
//             Agregar cómics
//           </Button>
//           <Button variant="danger" onClick={() => handleModalOption('overwrite')}>
//             Sobrescribir colección
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default FolderScanner;




// import React, { useState } from 'react';
// import { Container, Form, Button, ListGroup, Alert, Modal } from 'react-bootstrap';
// import CollectionService from '../services/CollectionService';

// const FolderScanner = () => {
//   const [filesInfo, setFilesInfo] = useState([]);
//   const [uploadStatus, setUploadStatus] = useState(null);
//   const [collectionName, setCollectionName] = useState('');
//   const [showModal, setShowModal] = useState(false);

//   // Procesa la selección de carpeta y extrae la estructura de archivos
//   const handleFolderSelect = (e) => {
//     const files = Array.from(e.target.files);
//     const comicsData = files.map(file => {
//       const relativePath = file.webkitRelativePath; // Ej.: "W/WITCHER/The Witcher #1.pdf"
//       const pathParts = relativePath.split('/');
//       const name = file.name.replace(/\.[^/.]+$/, '');
//       const directories = pathParts.slice(0, -1);
//       return {
//         name,
//         path: relativePath, // Se envía el campo "path"
//         directories,
//         isRead: false,
//         readAt: null
//       };
//     });
//     setFilesInfo(comicsData);
//   };

//   // Realiza la subida de la estructura con el modo especificado
//   const performUpload = async (mode) => {
//     try {
//       const payload = { comics: filesInfo, collectionName, mode };
//       console.log("Enviando payload (mode: " + mode + "):", JSON.stringify(payload).length, "bytes");
//       const response = await CollectionService.uploadCollectionStructure(payload);
//       setUploadStatus({ type: 'success', message: response.data.message });
//       console.log(response.data);
//     } catch (error) {
//       setUploadStatus({ type: 'error', message: 'Error al subir la estructura.' });
//       console.error(error);
//     }
//   };

//   // Verifica si la colección ya existe para el usuario
//   const checkCollectionExists = async () => {
//     try {
//       const response = await CollectionService.getCollections();
//       const collections = response.data;
//       return collections.some(
//         (col) => col.name.trim().toLowerCase() === collectionName.trim().toLowerCase()
//       );
//     } catch (error) {
//       console.error("Error al verificar la existencia de la colección:", error);
//       return false;
//     }
//   };

//   // Maneja la subida de la estructura
//   const handleUpload = async () => {
//     if (!collectionName.trim()) {
//       setUploadStatus({ type: 'danger', message: 'Debes ingresar un nombre para la colección.' });
//       return;
//     }
//     const exists = await checkCollectionExists();
//     if (exists) {
//       setShowModal(true);
//     } else {
//       await performUpload('create');
//     }
//   };

//   // Maneja la opción seleccionada en el modal
//   const handleModalOption = async (option) => {
//     setShowModal(false);
//     if (option === 'cancel') {
//       setUploadStatus({ type: 'info', message: 'Carga cancelada por el usuario.' });
//       return;
//     }
//     if (option === 'append') {
//       await performUpload('append');
//     }
//     if (option === 'overwrite') {
//       await performUpload('overwrite');
//     }
//   };

//   return (
//     <Container className="mt-4">
//       <h2>Crear Colección por Escaneo de Carpeta</h2>
//       <Form.Group controlId="collectionName">
//         <Form.Label>Nombre de la Colección</Form.Label>
//         <Form.Control
//           type="text"
//           placeholder="Ingresa el nombre de la colección"
//           value={collectionName}
//           onChange={(e) => setCollectionName(e.target.value)}
//         />
//       </Form.Group>

//       <Form.Group controlId="folderInput" className="mt-3">
//         <Form.Label>Selecciona una carpeta:</Form.Label>
//         <Form.Control
//           type="file"
//           webkitdirectory="true"
//           multiple
//           onChange={handleFolderSelect}
//         />
//       </Form.Group>
      
//       {filesInfo.length > 0 && (
//         <>
//           <h4 className="mt-3">Archivos detectados:</h4>
//           <ListGroup>
//             {filesInfo.map((comic, index) => (
//               <ListGroup.Item key={index}>
//                 <strong>{comic.name}</strong> - {comic.path}
//               </ListGroup.Item>
//             ))}
//           </ListGroup>
//           <Button variant="primary" className="mt-3" onClick={handleUpload}>
//             Subir Estructura
//           </Button>
//         </>
//       )}

//       {uploadStatus && (
//         <Alert variant={
//           uploadStatus.type === 'success' ? 'success' : 
//           (uploadStatus.type === 'error' ? 'danger' : 'info')
//         } className="mt-3">
//           {uploadStatus.message}
//         </Alert>
//       )}

//       <Modal show={showModal} onHide={() => handleModalOption('cancel')}>
//         <Modal.Header closeButton>
//           <Modal.Title>La colección ya existe</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>La colección <strong>{collectionName}</strong> ya existe.</p>
//           <p>¿Qué deseas hacer?</p>
//           <ul>
//             <li><strong>Cancelar:</strong> No subir ningún cómic.</li>
//             <li><strong>Agregar:</strong> Añadir los cómics a la colección existente.</li>
//             <li><strong>Sobrescribir:</strong> Reemplazar completamente la colección existente por la nueva estructura.</li>
//           </ul>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => handleModalOption('cancel')}>
//             Cancelar
//           </Button>
//           <Button variant="primary" onClick={() => handleModalOption('append')}>
//             Agregar cómics
//           </Button>
//           <Button variant="danger" onClick={() => handleModalOption('overwrite')}>
//             Sobrescribir colección
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default FolderScanner;
