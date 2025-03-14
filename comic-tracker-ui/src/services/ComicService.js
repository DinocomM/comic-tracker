import axios from 'axios';

const API_URL = 'http://localhost:5000/api/comics';

const getComics = () => {
  return axios.get(API_URL);
};

const uploadComicStructure = (data) => {
  return axios.post(`${API_URL}/uploadStructure`, data);
};

const updateComicStatus = (id) => {
  return axios.patch(`${API_URL}/${id}/toggle-read`);
};

const deleteComic = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

const ComicService = {
  getComics,
  uploadComicStructure,
  updateComicStatus,
  deleteComic,
};

export default ComicService;
