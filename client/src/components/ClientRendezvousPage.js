import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rendezVousService } from '../services/api';

const ClientRendezvousPage = () => {
  const { userId } = useAuth();
  const [disponibilites, setDisponibilites] = useState([]);
  const [mesRendezVous, setMesRendezVous] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [motif, setMotif] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const fetchRendezvous = async () => {
    try {
      // Récupérer les disponibilités
      const dispResponse = await rendezVousService.getDisponibilites();
      setDisponibilites(dispResponse.data);

      // Récupérer les rendez-vous du client
      const clientRdvResponse = await rendezVousService.getRendezvousClient();
      setMesRendezVous(clientRdvResponse.data);

      setIsLoading(false);
    } catch (err) {
      console.error('Erreur chargement RDV client:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || 'Impossible de charger les rendez-vous ou disponibilités.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) { // S'assurer que userId est disponible avant de fetch
      fetchRendezvous();
    }
  }, [userId]);

  const handleDemanderRendezvous = async (rendezVousId) => {
    setFormMessage('');
    if (!motif) {
      setFormMessage('Veuillez spécifier un motif pour le rendez-vous.');
      return;
    }
    try {
      const response = await rendezVousService.demanderRendezvous({ rendezVousId, motif });
      setFormMessage(response.data.message);
      setMotif(''); // Vider le motif
      fetchRendezvous(); // Recharger les listes après la demande
    } catch (err) {
      setFormMessage(err.response?.data?.message || 'Erreur lors de la demande de rendez-vous.');
      console.error('Erreur demande RDV:', err.response ? err.response.data : err);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Chargement des rendez-vous...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Gestion de mes Rendez-vous</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Prendre un nouveau rendez-vous</h2>
        {formMessage && <p className="mb-4 text-sm text-blue-600">{formMessage}</p>}
        
        <div className="mb-4">
          <label htmlFor="motif" className="block text-sm font-medium text-gray-700 mb-1">Motif de la demande</label>
          <textarea id="motif" value={motif} onChange={(e) => setMotif(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            rows="3" placeholder="Ex: Premier contact, besoin d'aide pour évaluer mes compétences..."></textarea>
        </div>

        {disponibilites.length === 0 ? (
          <p className="text-gray-600">Aucune disponibilité de consultant pour l'instant.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {disponibilites.map(dispo => (
              <li key={dispo.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium">{dispo.date} à {dispo.heure}</p>
                  {/* Assurez-vous que dispo.Consultant est bien peuplé par l'include dans le backend */}
                  {dispo.Consultant && <p className="text-sm text-gray-600">Consultant: {dispo.Consultant.prenom} {dispo.Consultant.nom}</p>}
                </div>
                <button onClick={() => handleDemanderRendezvous(dispo.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                  Demander ce RDV
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Mes Rendez-vous à venir</h2>
        {mesRendezVous.length === 0 ? (
          <p className="text-gray-600">Vous n'avez pas de rendez-vous enregistrés.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {mesRendezVous.map(rdv => (
              <li key={rdv.id} className="py-4">
                <p className="text-lg font-medium">{rdv.date} à {rdv.heure}</p>
                <p className="text-sm text-gray-600">Statut: {rdv.statut}</p>
                {/* Assurez-vous que rdv.Consultant est bien peuplé par l'include dans le backend */}
                {rdv.Consultant && <p className="text-sm text-gray-600">Consultant: {rdv.Consultant.prenom} {rdv.Consultant.nom}</p>}
                {rdv.motif && <p className="text-sm text-gray-600">Motif: {rdv.motif}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
          {/* LIEN DE RETOUR AU TABLEAU DE BORD CLIENT */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link to="/dashboard-client" className="text-blue-500 mt-4 inline-block">Retour au tableau de bord</Link>
          </div>
    </div>
  );
};

export default ClientRendezvousPage;