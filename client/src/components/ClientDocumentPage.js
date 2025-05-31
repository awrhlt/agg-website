// client/src/components/ClientDocumentPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { documentService } from '../services/api';

const ClientDocumentPage = () => {
  const { userId } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  const fetchDocuments = async () => {
    try {
      if (userId) { // S'assurer que userId est disponible
        const response = await documentService.getDocumentsByClient(userId);
        setDocuments(response.data);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Erreur chargement documents client:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || 'Impossible de charger les documents.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadMessage('');
    if (!selectedFile) {
      setUploadMessage('Veuillez sélectionner un fichier.');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile); // 'document' doit correspondre au nom du champ dans multer (upload.single('document'))
    formData.append('description', description);
    // formData.append('bilanId', someBilanId); // Si lié à un bilan spécifique
    // formData.append('consultantId', someConsultantId); // Si lié à un consultant spécifique

    try {
      const response = await documentService.uploadDocument(formData);
      setUploadMessage(response.data.message);
      setSelectedFile(null);
      setDescription('');
      fetchDocuments(); // Recharger la liste
    } catch (err) {
      setUploadMessage(err.response?.data?.message || 'Erreur lors du téléverserment.');
      console.error('Erreur upload document:', err.response ? err.response.data : err);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const response = await documentService.downloadDocument(docId);
      // Créer un lien temporaire pour télécharger le fichier
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Erreur téléchargement document:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || 'Erreur lors du téléchargement du document.');
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        const response = await documentService.deleteDocument(docId);
        setUploadMessage(response.data.message);
        fetchDocuments(); // Recharger la liste
      } catch (err) {
        setUploadMessage(err.response?.data?.message || 'Erreur lors de la suppression.');
        console.error('Erreur suppression document:', err.response ? err.response.data : err);
      }
    }
  };


  if (isLoading) return <div className="p-8 text-center">Chargement des documents...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Mes Documents</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Téléverser un nouveau document</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-gray-700">Fichier</label>
            <input type="file" id="document" onChange={handleFileChange} required
                   className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optionnel)</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      rows="2" placeholder="Ex: Mon CV mis à jour"></textarea>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" disabled={!selectedFile}>
            Téléverser
          </button>
          {uploadMessage && <p className="mt-2 text-sm text-blue-600">{uploadMessage}</p>}
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Mes documents téléversés</h2>
        {documents.length === 0 ? (
          <p className="text-gray-600">Aucun document téléversé pour l'instant.</p>
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
    </div>
  );
};

export default ClientDocumentPage;