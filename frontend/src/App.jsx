import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AddProductPage from './pages/AddProductPage';
import ProductionCentrePage from './pages/ProductionCentrePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/add-product" element={<AddProductPage />} />
      <Route path="/product/:id" element={<ProductionCentrePage />} />
    </Routes>
  );
}

export default App;