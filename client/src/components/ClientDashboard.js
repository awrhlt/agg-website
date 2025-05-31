// client/src/components/ClientDashboard.js (modifications)
import React, { useState, useEffect } from 'react'; // Import useEffect and useState
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get userId

const ClientDashboard = () => {
  const { userId, isClient } = useAuth(); // Get userId and isClient from context
  const [assessmentProgress, setAssessmentProgress] = useState(0);

  useEffect(() => {
    if (userId && isClient) {
      const localStorageKeyProgress = `assessment_progress_${userId}`;
      const savedProgress = localStorage.getItem(localStorageKeyProgress);
      if (savedProgress) {
        setAssessmentProgress(parseInt(savedProgress, 10));
      } else {
        setAssessmentProgress(0); // Reset if no saved progress
      }
    }
  }, [userId, isClient]);


  return (
    <div className="p-8 text-center bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Bienvenue sur votre Espace Client</h1>
      <p className="text-lg mb-6">
        Ici, vous pourrez suivre l'avancement de votre bilan de compétences, accéder à vos documents et bien plus encore.
      </p>

      {/* Affichage de la progression du questionnaire */}
      {isClient && ( // Assurez-vous que c'est un client avant d'afficher la progression
        <div className="mb-8 p-4 bg-blue-100 rounded-lg shadow-inner max-w-md mx-auto">
          <h3 className="text-blue-800 text-lg font-semibold mb-2">
            Progression de votre Bilan d'Auto-évaluation : {assessmentProgress}%
          </h3>
          <div className="w-full bg-gray-300 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${assessmentProgress}%` }}
            ></div>
          </div>
          {assessmentProgress < 100 ? (
            <p className="text-sm text-blue-700 text-center mt-2">
              Continuez votre questionnaire pour le compléter.
            </p>
          ) : (
            <p className="text-sm text-green-700 text-center mt-2">
              Votre questionnaire est complet ! Vous pouvez le soumettre depuis la page d'évaluation.
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Bouton pour le Questionnaire */}
        <Link
          to="/client/assessment"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Démarrer ou Poursuivre mon Questionnaire d'Auto-évaluation
        </Link>

        {/* Bouton pour le Chat */}
        <Link
          to="/chat"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ml-4"
        >
          Accéder au Chat
        </Link>

        {/* NOUVEAU BOUTON POUR LES RENDEZ-VOUS CLIENT */}
        <Link
          to="/client/rendezvous" // Route pour la page de rendez-vous client
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 mt-4" // mt-4 pour une nouvelle ligne si flex-wrap n'est pas utilisé
        >
          Gérer mes Rendez-vous
        </Link>

        <p className="text-gray-600">
          <Link to="/" className="text-blue-500 hover:text-blue-700">Retour à l'accueil</Link>
        </p>
        <Link to="/client/documents" className="inline-flex items-center px-6 py-3 border ... bg-orange-600 hover:bg-orange-700 ml-4">
  Gérer mes Documents
</Link>
      </div>
    </div>
  );
};

export default ClientDashboard;