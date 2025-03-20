import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

import Dashboard from './components/Dashboard/Dashboard';
import CollectionList from './components/Dashboard/CollectionList';
import CollectionManager from './components/Dashboard/CollectionManager';
import CollectionComics from './components/Dashboard/CollectionComics';
import FolderScanner from './components/FolderScanner';

import PrivateRoute from './components/Common/PrivateRoute';
import Layout from './components/Common/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/stats" element={<div>Estadísticas</div>} />
                  <Route path="/profile" element={<div>Perfil</div>} />
                  <Route path="/folder-scanner" element={<FolderScanner />} />
                  <Route path="/collections" element={<CollectionManager />} />
                  {/* <Route path="/collections" element={<CollectionList />} /> */}
                  <Route path="/collections/:id/comics" element={<CollectionComics />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
