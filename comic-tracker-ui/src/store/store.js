import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Aquí podrás agregar otros slices, por ejemplo, para gestionar cómics, colecciones, etc.
  },
});

export default store;
