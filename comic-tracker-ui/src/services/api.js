// src/services/api.js
import axios from 'axios';
import store from '../store/store'; // Asegúrate de que esta ruta sea la correcta según tu estructura

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Base URL para tus endpoints
});

// Interceptor para agregar el token del estado de Redux a cada petición
api.interceptors.request.use(
  (config) => {
    // Obtén el token actual del estado de Redux
    const { auth } = store.getState();
    if (auth && auth.token) {
      config.headers['Authorization'] = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
