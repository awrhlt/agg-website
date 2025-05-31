// client/src/components/ChatSelection.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bilanService, messageService } from '../services/api';

const ChatSelection = () => {
  const { userId, userType } = useAuth();
  const [bilans, setBilans] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [clients, setClients] = useState([]); // NOUVEL ÉTAT pour les clients
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) { // S'assurer que l'userId est disponible
          setError("Erreur : ID utilisateur non disponible. Veuillez vous reconnecter.");
          setIsLoading(false);
          return;
        }

        if (userType === 'client') {
          // Client: Récupérer ses bilans pour chater avec le consultant du bilan
          const userBilans = await bilanService.getBilansClient(userId); 
          setBilans(userBilans.data);

          // Récupérer la liste de tous les consultants (si le client peut initier avec n'importe qui)
          const allConsultants = await messageService.getAllConsultants(); 
          setConsultants(allConsultants.data);

        } else if (userType === 'consultant') {
          // Consultant: Récupérer tous les bilans pour chater avec les clients
          const allBilans = await bilanService.getAllBilans(); 
          setBilans(allBilans.data);
          const allClients = await messageService.getAllClients(); 
          setClients(allClients.data);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des options de chat:', err.response ? err.response.data : err);
        setError(err.response?.data?.message || 'Impossible de charger les options de chat.');
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId, userType]);

  if (isLoading) {
    return <div className="p-8 text-center">Chargement des options de chat...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Démarrer une conversation</h1>

      {userType === 'client' && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Mes Bilans</h2>
          {bilans.length === 0 ? (
            <p className="text-gray-600">Vous n'avez pas encore de bilans.</p>
          ) : (
            <ul className="space-y-2">
              {bilans.map(bilan => (
                <li key={bilan.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <span>Bilan #{bilan.id} - Statut: {bilan.status}</span>
                  {bilan.Consultant ? (
                    <Link to={`/chat/bilan/${bilan.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                      Chat avec mon consultant
                    </Link>
                  ) : (
                    <span className="text-gray-500">Consultant non assigné</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Initier un nouveau contact</h2>
          <p className="text-gray-600 mb-4">Envoyer un message à un consultant pour la première fois.</p>
          <Link to="/chat/initiate" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            Parler à un consultant (nouveau contact)
          </Link>
          
          {consultants.length > 0 && (
            <>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Parler à un consultant spécifique</h2>
              <ul className="space-y-2">
                {consultants.map(consultant => (
                  <li key={consultant.id} className="p-4 border rounded-lg flex justify-between items-center">
                    <span>{consultant.prenom} {consultant.nom} ({consultant.email})</span>
                    <Link to={`/chat/user/${consultant.id}`} className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600">
                      Chatter
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

        </div>
      )}

      {userType === 'consultant' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Bilans à suivre</h2>
          {bilans.length === 0 ? (
            <p className="text-gray-600">Aucun bilan soumis par vos clients.</p>
          ) : (
            <ul className="space-y-2">
              {bilans.map(bilan => (
                <li key={bilan.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <span>Bilan #{bilan.id} - Client: {bilan.Client ? `${bilan.Client.prenom} (${bilan.Client.email})` : 'N/A'}</span>
                  <Link to={`/chat/bilan/${bilan.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    Chat avec ce client
                  </Link>
                </li>
              ))}
            </ul>
          )}
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Tous les clients</h2>
          {clients.length === 0 ? (
            <p className="text-gray-600">Aucun client enregistré pour l'instant.</p>
          ) : (
            <ul className="space-y-2">
              {clients.map(client => (
                <li key={client.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <span>{client.prenom} {client.nom} ({client.email})</span>
                  <Link to={`/chat/user/${client.id}`} className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600">
                    Chatter
                  </Link>
                </li>
              ))}
            </ul>
          )}
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Chats en cours (Messages d'initiation)</h2>
          <p className="text-gray-600">Consultez les messages envoyés par des clients pour la première fois.</p>
          <Link to="/chat/initiate" className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
            Voir les nouveaux contacts (pour consultants)
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChatSelection;