import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Ejemplo de thunk para hacer login (simulado, en un caso real llamarías a tu API)
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, thunkAPI) => {
    try {
      // Aquí harías la llamada al backend. Por ejemplo:
      // const response = await axios.post('/api/users/login', { email, password });
      // return response.data;
      
      // Simulamos una respuesta exitosa:
      const dummyToken = 'dummy-token';
      return { token: dummyToken, email };
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
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.email = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.email = action.payload.email;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Error al iniciar sesión';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
