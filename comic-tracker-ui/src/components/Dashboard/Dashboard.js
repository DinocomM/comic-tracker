import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Aquí podrías extraer datos del store o a través de una llamada a tu API.
  const totalComics = 120;
  const readComics = 75;
  const unreadComics = totalComics - readComics;
  const readPercentage = ((readComics / totalComics) * 100).toFixed(2);

  return (
    <div>
      <h1>Bienvenido a tu Dashboard</h1>
      <Row className="mb-4">
        <Col md={4}>
          <Card bg="success" text="white" className="mb-3">
            <Card.Body>
              <Card.Title>Total de Cómics</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>{totalComics}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card bg="info" text="white" className="mb-3">
            <Card.Body>
              <Card.Title>Cómics Leídos</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>{readComics}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card bg="warning" text="white" className="mb-3">
            <Card.Body>
              <Card.Title>Progreso de Lectura</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>{readPercentage}%</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sección de Acciones */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Acciones Rápidas</Card.Title>
              <Button as={Link} to="/collections" variant="primary" className="me-2">
                Ver Colecciones
              </Button>
              <Button as={Link} to="/folder-scanner" variant="secondary">
              Nueva Coleccion por Escaneo de Carpeta
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
