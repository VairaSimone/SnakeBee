// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="text-center mt-10">
    <h1 className="text-3xl font-bold text-red-600">404 - Pagina non trovata</h1>
    <p className="mt-2 text-gray-700">Il link che hai seguito non porta a nulla.</p>
    <Link to="/home" className="text-green-700 hover:underline mt-4 block">← Torna alla Home</Link>
  </div>
);

export default NotFound;
