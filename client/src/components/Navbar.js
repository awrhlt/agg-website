import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // NOUVEL IMPORT

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, userType, logout } = useAuth();

  console.log('Navbar rendu. IsAuthenticated:', isAuthenticated, 'UserType:', userType);

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BarChart3 size={32} className="text-blue-200" />
              <span className="text-xl font-bold">BilanPro</span>
            </Link>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="hover:text-blue-200 transition-colors duration-200"
            >
              Accueil
            </Link>

            {/* Affichage conditionnel des liens */}
            {isAuthenticated ? (
              <>
                {userType === 'client' && (
                    <Link 
                      to="/dashboard-client" 
                      className="hover:text-blue-200 transition-colors duration-200"
                    >
                      Mon Tableau de Bord
                    </Link>
                )}
                {userType === 'consultant' && (
                    <Link 
                      to="/dashboard-consultant" 
                      className="hover:text-blue-200 transition-colors duration-200"
                    >
                      Tableau de Bord Consultant
                    </Link>
                )}
                <button 
                  onClick={logout} // Appel de la fonction de déconnexion
                  className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:text-blue-200 transition-colors duration-200"
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-blue-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-700">
              <Link 
                to="/" 
                className="block px-3 py-2 hover:bg-blue-600 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Accueil
              </Link>
              {isAuthenticated ? (
                <>
                  {userType === 'client' && (
                      <Link 
                        to="/dashboard-client" 
                        className="block px-3 py-2 hover:bg-blue-600 rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        Mon Tableau de Bord
                      </Link>
                  )}
                  {userType === 'consultant' && (
                      <Link 
                        to="/dashboard-consultant" 
                        className="block px-3 py-2 hover:bg-blue-600 rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        Tableau de Bord Consultant
                      </Link>
                  )}
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="block w-full text-left px-3 py-2 hover:bg-red-600 rounded-md bg-red-700"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 hover:bg-blue-600 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    className="block px-3 py-2 hover:bg-blue-600 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;