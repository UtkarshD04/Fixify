import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('userToken');
  const userData = sessionStorage.getItem('userData');

  return (token && userData) ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
