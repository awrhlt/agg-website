// client/src/components/ConsultantDocumentPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { documentService, messageService } from '../services/api'; // messageService pour getAllClients

const ConsultantDocumentPage = () => {
  const { userId } = useAuth();
  const [clients, setClients] = useState([]); // Pour lister les clients du consultant
  const [selectedClientId, setSelectedClientId] = useState(''); // Pour filtrer les documents par client
  const [documents, setDocuments] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Récupérer la liste de tous les clients (ou seulement ceux assignés au consultant)
        const response = await messageService.getAllClients(); // Ou une route spécifique /api/consultant/clients
        setClients(response.data);
        setIsLoadingClients(false);
      } catch (err) {
        console.error('Erreur chargement clients pour documents:', err);
        setError('Impossible de charger la liste des clients.');
        setIsLoadingClients(false);
      }
    };
    fetchClients();
  }, [userId]);

  useEffect(() => {
    const fetchDocumentsForSelectedClient = async () => {
      if (selectedClientId) {
        setIsLoadingDocs(true);
        setError('');
        try {
          const response = await documentService.getDocumentsByClient(selectedClientId);
          setDocuments(response.data);
          setIsLoadingDocs(false);
        } catch (err) {
          console.error('Erreur chargement documents client sélectionné:', err);
          setError('Impossible de charger les documents pour le client sélectionné.');
          setIsLoadingDocs(false);
        }
      } else {
        setDocuments([]); // Vider la liste si aucun client n'est sélectionné
      }
    };
    fetchDocumentsForSelectedClient();
  }, [selectedClientId]);


  const handleDownload = async (docId, fileName) => {
    try {
      const response = await documentService.downloadDocument(docId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Erreur téléchargement document:', err);
      setError(err.response?.data?.message || 'Erreur lors du téléchargement du document.');
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        const response = await documentService.deleteDocument(docId);
        // setUploadMessage(response.data.message); // Pas de message d'upload ici
        // Après suppression, si un client est sélectionné, rafraîchir ses documents
        if (selectedClientId) {
            const updatedDocs = await documentService.getDocumentsByClient(selectedClientId);
            setDocuments(updatedDocs.data);
        }
        alert(response.data.message); // Alerte de succès
      } catch (err) {
        console.error('Erreur suppression document:', err);
        setError(err.response?.data?.message || 'Erreur lors de la suppression.');
      }
    }
  };

  if (isLoadingClients) return <div className="p-8 text-center">Chargement des clients...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Gestion des Documents Clients</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Sélectionner un client</h2>
        <select 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
        >
          <option value="">-- Choisir un client --</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.prenom} {client.nom} ({client.email})
            </option>
          ))}
        </select>
      </div>

      {selectedClientId && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Documents du client sélectionné</h2>
          {isLoadingDocs ? (
            <p className="text-center text-gray-600">Chargement des documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-gray-600">Aucun document pour ce client.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {documents.map(doc => (
                <li key={doc.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium">{doc.fileName} ({doc.fileType})</p>
                    {doc.description && <p className="text-sm text-gray-600">{doc.description}</p>}
                    <p className="text-sm text-gray-500">Téléversé le: {new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => handleDownload(doc.id, doc.fileName)}
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">
                      Télécharger
                    </button>
                    <button onClick={() => handleDelete(doc.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultantDocumentPage;