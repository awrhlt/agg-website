// client/src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // NOUVEL IMPORT

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, userType } = useAuth(); // Récupère l'état via le contexte

  if (!isAuthenticated) {
    // Si pas authentifié, redirige vers la page de connexion
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userType)) {
    // Si le rôle ne correspond pas, redirige vers l'accueil ou une page non autorisée
    console.warn(`Accès refusé pour le rôle: ${userType}. Rôles autorisés: ${allowedRoles.join(', ')}`);
    return <Navigate to="/" replace />; // Ou vers une page '/unauthorized' si vous en créez une
  }

  // Si authentifié et rôle autorisé, affiche les routes enfants
  return <Outlet />;
};

export default PrivateRoute;