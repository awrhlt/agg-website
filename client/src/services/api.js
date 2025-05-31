import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Services d'authentification
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Services des bilans
export const bilanService = {
  getBilansClient: (clientId) => api.get(`/bilans/client/${clientId}`),
  createBilan: (bilanData) => api.post('/bilans', bilanData),
  getAllBilans: () => api.get('/bilans'),
  getBilanSynthesis: (clientId) => api.get(`/bilans/client/${clientId}/synthesis`),
  // NOUVELLE MÉTHODE POUR ENVOYER LA SYNTHÈSE AU CLIENT
  sendBilanSynthesis: (clientId) => api.post(`/bilans/client/${clientId}/send-synthesis`), // <-- AJOUTÉE ICI
};

// Services des messages (pour le chat)
export const messageService = {
  getMessagesByBilan: (bilanId) => api.get(`/messages/bilan/${bilanId}`),
  getMessagesBetweenUsers: (fromUserId, toUserId) => api.get(`/messages?from=${fromUserId}&to=${toUserId}`),
  getUserById: (userId) => api.get(`/messages/${userId}`),
  getAllConsultants: () => api.get('/messages/consultants'),
  getAllClients: () => api.get('/messages/clients'),
};

// Services des rendez-vous
export const rendezVousService = {
  // Consultant
  addDisponibilite: (data) => api.post('/rendezvous/disponibilites', data),
  getRendezvousConsultant: () => api.get('/rendezvous/consultant'),
  confirmerRendezvous: (rendezVousId, statut) => api.put(`/rendezvous/${rendezVousId}/confirmation`, { statut }),

  // Client
  getDisponibilites: (consultantId = '') => api.get(`/rendezvous/disponibilites${consultantId ? `?consultantId=${consultantId}` : ''}`),
  demanderRendezvous: (data) => api.post('/rendezvous/demande', data),
  getRendezvousClient: () => api.get('/rendezvous/client'),
};

export const documentService = {
  uploadDocument: (data) => api.post('/documents/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getDocumentsByClient: (clientId) => api.get(`/documents/client/${clientId}`),
  downloadDocument: (documentId) => api.get(`/documents/download/${documentId}`, { responseType: 'blob' }),
  deleteDocument: (documentId) => api.delete(`/documents/${documentId}`),
};
export default api;