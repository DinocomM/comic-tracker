// src/services/CollectionService.js
import api from './api';

const getCollections = () => api.get('/collections');
const createCollection = (collectionData) => api.post('/collections', collectionData);
const updateCollection = (id, collectionData) => api.patch(`/collections/${id}`, collectionData);
const deleteCollection = (id) => api.delete(`/collections/${id}`);
const uploadCollectionStructure = (payload) => api.post('/collections/uploadStructure', payload);
const markCollectionReadStatus = (collectionId, isRead) =>
  api.patch(`/collections/${collectionId}/mark-read`, { isRead });

const CollectionService = {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  uploadCollectionStructure,
  markCollectionReadStatus,
};

export default CollectionService;
