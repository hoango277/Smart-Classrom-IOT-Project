import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import UpdateOTA from './pages/UpdateOTA';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/common/ProtectedRoute';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ota"
        element={
          <ProtectedRoute>
            <UpdateOTA />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default Router;
