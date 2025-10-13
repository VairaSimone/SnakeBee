import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectUser } from '../features/userSlice';
import { FaSpinner } from 'react-icons/fa';

const AdminProtectedRoute = ({ children }) => {
    const user = useSelector(selectUser);
    const location = useLocation();
    
    // Potresti voler aggiungere uno stato di caricamento dal tuo userSlice se il caricamento dell'utente è asincrono
    const isLoading = false; // Sostituisci con il tuo selettore di stato di caricamento

    if (isLoading) {
         return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-green-500 text-4xl" />
            </div>
        );
    }
    
    if (!user || user.role !== 'admin') {
        // L'utente non è un admin o non è loggato, reindirizza
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminProtectedRoute;
