// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Récupérer l'état initial depuis localStorage (persistance de session)
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [userType, setUserType] = useState(localStorage.getItem('userType'));
  const navigate = useNavigate();

  console.log('AuthContext initialisé/re-rendu. Token:', token ? 'Présent' : 'Absent', 'UserType:', userType, 'UserId:', userId);

  // Mettre à jour localStorage lorsque l'état change
  useEffect(() => {
    console.log('AuthContext useEffect - Mise à jour localStorage. Token:', token ? 'Présent' : 'Absent', 'UserType:', userType, 'UserId:', userId);
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
    if (userType) {
      localStorage.setItem('userType', userType);
    } else {
      localStorage.removeItem('userType');
    }
  }, [token, userId, userType]);

  const login = (newToken, newUserId, newUserType) => {
    setToken(newToken);
    setUserId(newUserId);
    setUserType(newUserType);
    console.log('AuthContext: Fonction login appelée. Nouveau Token:', newToken ? 'Présent' : 'Absent', 'Nouveau UserType:', newUserType, 'Nouveau UserId:', newUserId);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserType(null);
    localStorage.clear();
    console.log('AuthContext: Fonction logout appelée. Utilisateur déconnecté.');
    navigate('/login');
  };

  const isAuthenticated = !!token; // Vrai si un token existe
  const isClient = isAuthenticated && userType === 'client';
  const isConsultant = isAuthenticated && userType === 'consultant';

  const value = {
    token,
    userId,
    userType,
    isAuthenticated,
    isClient,
    isConsultant,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  // console.log('useAuth appelé. Contexte:', context); // Décommentez pour un log très fréquent
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};