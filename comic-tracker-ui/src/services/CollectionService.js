// src/services/CollectionService.js
import api from './api';

// const getCollections = () => api.get('/collections');
const getCollections = (params = {}) => api.get('/collections', { params });
const createCollection = (collectionData) => api.post('/collections', collectionData);
const updateCollection = (id, collectionData) => api.patch(`/collections/${id}`, collectionData);
const deleteCollection = (id) => api.delete(`/collections/${id}`);
const uploadCollectionStructure = (payload) => api.post('/collections/uploadStructure', payload);
const markCollectionReadStatus = (collectionId, isRead) =>
  api.patch(`/collections/${collectionId}/mark-read`, { isRead });

const getCollection = (id) => api.get(`/collections/${id}`);
const getSubcollections = (parentId) => api.get(`/collections?parent=${parentId}`);



const CollectionService = {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  uploadCollectionStructure,
  markCollectionReadStatus,

  getCollection,
  getSubcollections,
};

export default CollectionService;
