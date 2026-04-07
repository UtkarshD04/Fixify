import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRouteProvider = ({ children }) => {
  const token = sessionStorage.getItem('providerToken');
  const utilityData = sessionStorage.getItem('utilityData');

  return (token && utilityData) ? children : <Navigate to="/utility-login" replace />;
};

export default ProtectedRouteProvider;