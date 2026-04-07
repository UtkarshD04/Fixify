import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  const userData = localStorage.getItem('userData');

  return (token && userData) ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
