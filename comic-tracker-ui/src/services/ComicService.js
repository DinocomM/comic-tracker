import api from './api'; // Asegúrate de que la ruta sea correcta

const API_URL = '/comics'; // Ahora, API_URL se usa como path relativo a la baseURL

const getComics = () => {
  return api.get(API_URL);
};

const uploadComicStructure = (data) => {
  return api.post(`${API_URL}/uploadStructure`, data);
};

const updateComicStatus = (id) => {
  return api.patch(`${API_URL}/${id}/toggle-read`);
};

const deleteComic = (id) => {
  return api.delete(`${API_URL}/${id}`);
};

const getComicsByCollection = (collectionId) =>
  api.get(`${API_URL}/collection/${collectionId}`);

const updateComic = (id, data) => 
  api.patch(`/comics/${id}`, data);

const ComicService = {
  getComics,
  uploadComicStructure,
  updateComicStatus,
  deleteComic,
  getComicsByCollection,
  updateComic,
};

export default ComicService;
