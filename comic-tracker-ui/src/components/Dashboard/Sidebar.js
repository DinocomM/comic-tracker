import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="bg-light vh-100 p-3 border-end">
      <h5 className="mb-4">Menú</h5>
      <Nav defaultActiveKey="/" className="flex-column">
        <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
        <Nav.Link as={Link} to="/collections">Colecciones</Nav.Link>
        <Nav.Link as={Link} to="/stats">Estadísticas</Nav.Link>
        <Nav.Link as={Link} to="/profile">Perfil</Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
