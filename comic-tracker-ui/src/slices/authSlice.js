import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Acción para iniciar sesión (login)
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', { email, password });
      return response.data; // Debe incluir { token, user: { email, name, ... } }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Acción para registrar un usuario
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password, name }, thunkAPI) => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', { email, password, name });
      return response.data; // Se espera { message: 'Usuario registrado correctamente' }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    email: null,
    name: null,
    status: 'idle',         // Para login
    error: null,            // Para login
    registerStatus: 'idle', // Para registro
    registerError: null,    // Para registro
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.email = null;
      state.name = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Para login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.email = action.payload.user.email;
        state.name = action.payload.user.name;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Error al iniciar sesión';
      })
      // Para registro
      .addCase(registerUser.pending, (state) => {
        state.registerStatus = 'loading';
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerStatus = 'succeeded';
        // El backend devuelve un mensaje y no un token, por eso no se actualiza el token
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerStatus = 'failed';
        state.registerError = action.payload || 'Error en el registro';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
