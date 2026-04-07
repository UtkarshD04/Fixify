import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRouteProvider = ({ children }) => {
  const token = localStorage.getItem('providerToken');
  const utilityData = localStorage.getItem('utilityData');

  return (token && utilityData) ? children : <Navigate to="/utility-login" replace />;
};

export default ProtectedRouteProvider;