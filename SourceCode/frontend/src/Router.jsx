import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import UpdateOTA from './pages/UpdateOTA';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/ota" element={<UpdateOTA />} />
    </Routes>
  );
};

export default Router;
