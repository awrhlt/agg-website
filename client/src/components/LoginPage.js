// client/src/components/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  console.log('LoginPage rendu. État actuel via useAuth:', useAuth());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('LoginPage: Soumission du formulaire de connexion...');

    try {
      const response = await authService.login({ email, password });
      console.log('LoginPage: Réponse du backend reçue:', response.data);

      if (response.data.token && response.data.user) {
        // --- MODIFICATION ICI : Utilisez response.data.user.role ---
        login(response.data.token, response.data.user.id, response.data.user.role); 
        
        const userRole = response.data.user.role; // Récupérez 'role' du backend
        console.log('LoginPage: Login réussi. UserRole du backend:', userRole, '. Tentative de redirection...');

        if (userRole === 'client') { // Comparez avec 'client' ou 'consultant'
            navigate('/dashboard-client');
        } else if (userRole === 'consultant') { // Comparez avec 'client' ou 'consultant'
            navigate('/dashboard-consultant');
        } else {
            console.warn('LoginPage: UserRole non reconnu, redirection vers l\'accueil.', userRole);
            navigate('/'); 
        }
      } else {
        console.error('LoginPage: Login échoué. Token ou User manquant dans la réponse du backend.', response.data);
        setError('Erreur de connexion: token ou informations utilisateur non reçus.');
      }
    } catch (err) {
      console.error('LoginPage: Erreur lors de l\'appel API de connexion:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input 
              type="email" 
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input 
              type="password" 
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Se connecter
          </button>
        </form>
        
        <p className="text-center mt-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Retour à l'accueil
          </Link>
        </p>
        <p className="text-center mt-2 text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;