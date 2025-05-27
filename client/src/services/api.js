import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configuration axios
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
};

export default api;