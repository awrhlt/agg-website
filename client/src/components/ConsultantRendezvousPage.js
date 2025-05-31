import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rendezVousService } from '../services/api';

const ConsultantRendezvousPage = () => {
  const { userId } = useAuth();
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [mesRendezVous, setMesRendezVous] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const fetchRendezvous = async () => {
    try {
      const response = await rendezVousService.getRendezvousConsultant();
      setMesRendezVous(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur chargement RDV consultant:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || 'Impossible de charger les rendez-vous.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) { // S'assurer que userId est disponible avant de fetch
      fetchRendezvous();
    }
  }, [userId]);

  const handleAddDisponibilite = async (e) => {
    e.preventDefault();
    setFormMessage('');
    try {
      const response = await rendezVousService.addDisponibilite({ date, heure });
      setFormMessage(response.data.message);
      setDate('');
      setHeure('');
      fetchRendezvous(); // Recharger la liste après ajout
    } catch (err) {
      setFormMessage(err.response?.data?.message || 'Erreur lors de l\'ajout de disponibilité.');
      console.error('Erreur add disponibilite:', err.response ? err.response.data : err);
    }
  };

  const handleConfirmerAnnuler = async (rendezVousId, statut) => {
    try {
      const response = await rendezVousService.confirmerRendezvous(rendezVousId, statut);
      setFormMessage(response.data.message);
      fetchRendezvous(); // Recharger la liste après confirmation/annulation
    } catch (err) {
      setFormMessage(err.response?.data?.message || 'Erreur lors de la mise à jour du RDV.');
      console.error('Erreur confirmation RDV:', err.response ? err.response.data : err);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Chargement des rendez-vous...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Gestion des Rendez-vous Consultant</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ajouter une disponibilité</h2>
        <form onSubmit={handleAddDisponibilite} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="heure" className="block text-sm font-medium text-gray-700">Heure</label>
            <input type="time" id="heure" value={heure} onChange={(e) => setHeure(e.target.value)} required
                           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Ajouter Disponibilité
          </button>
          {formMessage && <p className="mt-2 text-sm text-blue-600">{formMessage}</p>}
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Mes Rendez-vous</h2>
        {mesRendezVous.length === 0 ? (
          <p className="text-gray-600">Aucun rendez-vous pour l'instant.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {mesRendezVous.map(rdv => (
              <li key={rdv.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium">{rdv.date} à {rdv.heure}</p>
                  <p className="text-sm text-gray-600">Statut: {rdv.statut}</p>
                  {/* Assurez-vous que rdv.Client est bien peuplé par l'include dans le backend */}
                  {rdv.Client && <p className="text-sm text-gray-600">Client: {rdv.Client.prenom} {rdv.Client.nom} ({rdv.Client.email})</p>}
                  {rdv.motif && <p className="text-sm text-gray-600">Motif: {rdv.motif}</p>}
                </div>
                <div className="space-x-2">
                  {rdv.statut === 'demandé' && (
                    <button onClick={() => handleConfirmerAnnuler(rdv.id, 'confirmé')}
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">
                      Confirmer
                    </button>
                  )}
                  {(rdv.statut === 'demandé' || rdv.statut === 'confirmé') && (
                    <button onClick={() => handleConfirmerAnnuler(rdv.id, 'annulé')}
                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">
                      Annuler
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConsultantRendezvousPage;