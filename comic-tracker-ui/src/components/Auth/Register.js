import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../slices/authSlice';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { registerStatus, registerError } = useSelector((state) => state.auth);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'danger', text: 'Las contraseñas no coinciden' });
      return;
    }
    try {
      await dispatch(registerUser({ email, password, name })).unwrap();
      setMessage({ type: 'success', text: 'Usuario registrado correctamente. Redirigiendo a login...' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'Error en el registro' });
    }
  };

  return (
    <Container className="mt-5">
      <h2>Registro de Usuario</h2>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formName">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingresa tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formEmail" className="mt-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formPassword" className="mt-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Ingresa una contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formConfirmPassword" className="mt-3">
          <Form.Label>Confirmar Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirma la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-4" disabled={registerStatus === 'loading'}>
          {registerStatus === 'loading' ? 'Registrando...' : 'Registrarse'}
        </Button>
      </Form>
    </Container>
  );
};

export default Register;
