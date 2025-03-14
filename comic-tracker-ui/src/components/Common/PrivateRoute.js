import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Obtenemos el estado de autenticación desde Redux
  const token = useSelector((state) => state.auth.token);

  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
