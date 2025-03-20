import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../slices/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // Despacha la acción de login usando Redux Toolkit
      const result = await dispatch(loginUser({ email, password })).unwrap();
      // Opcional: guardar en localStorage para persistencia
      localStorage.setItem('token', result.token);
      setMessage({ type: 'success', text: 'Inicio de sesión exitoso!' });
      console.log("Token guardado, redirigiendo al Dashboard...");
      navigate('/');
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.message || 'Error al iniciar sesión' 
      });
      console.error("Error en login:", error);
    }
    setLoading(false);
  };

  return (
    <Container className="mt-5">
      <h2>Iniciar Sesión</h2>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formEmail">
          <Form.Label>Email:</Form.Label>
          <Form.Control
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formPassword" className="mt-3">
          <Form.Label>Contraseña:</Form.Label>
          <Form.Control
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </Button>
      </Form>
      <div className="mt-3">
        <p>
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </Container>
  );
};

export default Login;
