import React from 'react';
import { Container, Row, Col, Navbar, Nav, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Dashboard/Sidebar';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/">Comic Tracker</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* Opcionalmente agregar más links */}
            </Nav>
            <Button variant="outline-light" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Contenido */}
      <Container fluid>
        <Row>
          <Col md={3} className="p-0">
            <Sidebar />
          </Col>
          <Col md={9} className="p-4">
            {children}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Layout;
