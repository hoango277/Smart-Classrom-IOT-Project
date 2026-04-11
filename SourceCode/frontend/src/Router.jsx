import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import UpdateOTA from './pages/UpdateOTA';
import NFCManagement from './pages/NFCManagement';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

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
          <AdminRoute>
            <UpdateOTA />
          </AdminRoute>
        }
      />
      <Route
        path="/nfc"
        element={
          <AdminRoute>
            <NFCManagement />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default Router;
