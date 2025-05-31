// client/src/components/ConsultantDashboard.js (modifications)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bilanService } from '../services/api'; // Importez le service des bilans

const ConsultantDashboard = () => {
  const [bilans, setBilans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBilans = async () => {
      try {
        const userType = localStorage.getItem('userType');
        if (userType !== 'consultant') {
          setError("Accès non autorisé. Vous n'êtes pas un consultant.");
          setIsLoading(false);
          navigate('/');
          return;
        }

        const response = await bilanService.getAllBilans(); // Récupère tous les bilans

        setBilans(response.data);
        setIsLoading(false);

      } catch (err) {
        console.error('Erreur lors de la récupération des bilans:', err.response ? err.response.data : err);
        setError(err.response?.data?.message || 'Erreur lors du chargement des bilans.');
        setIsLoading(false);
      }
    };

    fetchBilans();
  }, [navigate]);

  if (isLoading) {
    return <div className="p-8 text-center">Chargement des bilans...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tableau de Bord Consultant</h1>
      <p className="mb-4">Liste des bilans de compétences soumis par les clients.</p>

      {/* BOUTONS D'ENTRÉE GÉNÉRIQUES */}
      <div className="mb-8 text-center flex justify-center space-x-4">
        {/* Bouton pour le Chat */}
        <Link
          to="/chat"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Accéder au Chat (Sélection)
        </Link>

        {/* NOUVEAU BOUTON POUR LES RENDEZ-VOUS CONSULTANT */}
        <Link
          to="/consultant/rendezvous"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Gérer les Rendez-vous
        </Link>
        {/* Bouton pour Gérer les Documents Clients */}
        <Link
          to="/consultant/documents" // Cette route existe déjà
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Gérer les Documents Clients
        </Link>
      </div>

      {bilans.length === 0 ? (
        <p className="text-center text-gray-600">Aucun bilan soumis pour l'instant.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-blue-100 text-left text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6">ID Bilan</th>
                <th className="py-3 px-6">Client (Email)</th>
                <th className="py-3 px-6">Consultant Assigné</th>
                <th className="py-3 px-6">Date de Soumission</th>
                <th className="py-3 px-6">Statut</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {bilans.map((bilan) => (
                <tr key={bilan.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{bilan.id}</td>
                  <td className="py-3 px-6 text-left">
                    {bilan.Client ? `${bilan.Client.prenom} ${bilan.Client.nom} (${bilan.Client.email})` : 'N/A'}
                  </td>
                  <td className="py-3 px-6 text-left">{bilan.Consultant ? `${bilan.Consultant.prenom} ${bilan.Consultant.nom}` : 'Non assigné'}</td>
                  <td className="py-3 px-6 text-left">{new Date(bilan.submissionDate).toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-left">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold
                      ${bilan.status === 'submitted' ? 'bg-yellow-200 text-yellow-800' :
                        bilan.status === 'in_review' ? 'bg-blue-200 text-blue-800' :
                        'bg-green-200 text-green-800'}`}>
                      {bilan.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left flex items-center space-x-2">
                    <Link
                      to={`/consultant/bilan/${bilan.id}`} // Cette route pourrait être pour les détails bruts du bilan
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                    >
                      Voir Détails
                    </Link>
                    {/* NOUVEAU BOUTON POUR LA SYNTHÈSE */}
                    {bilan.Client && ( // S'assurer qu'il y a un client associé au bilan
                      <Link
                        to={`/consultant/bilan/${bilan.Client.id}/synthesis`} // Lien vers la synthèse du client du bilan
                        className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-1 px-3 rounded text-xs"
                      >
                        Voir Synthèse
                      </Link>
                    )}
                    {bilan.Client && bilan.Consultant && (
                        <Link
                            to={`/chat/bilan/${bilan.id}`}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                        >
                            Chat
                        </Link>
                    )}
                    {bilan.Client && !bilan.Consultant && (
                        <Link
                            to={`/chat/user/${bilan.Client.id}`}
                            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-xs"
                        >
                            Chat Client
                        </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConsultantDashboard;