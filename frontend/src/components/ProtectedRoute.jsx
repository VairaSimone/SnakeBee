import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectUser } from '../features/userSlice';

const ProtectedRoute = ({ children }) => {
  const user = useSelector(selectUser);

  if (user === null) {
    const token = localStorage.getItem('token');
    if (token) {
      return <div>Caricamento...</div>;
    } else {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;
