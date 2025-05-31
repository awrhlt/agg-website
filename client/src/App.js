import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AssessmentQuestionnaire from './components/AssessmentQuestionnaire';
import ClientDashboard from './components/ClientDashboard';
import ConsultantDashboard from './components/ConsultantDashboard';
import PrivateRoute from './components/PrivateRoute';
import ChatWindow from './components/ChatWindow';
import ChatSelection from './components/ChatSelection';

// Composants des pages de rendez-vous (MAINTENANT IMPORTÉS, PLUS DÉFINIS TEMPORAIREMENT ICI)
import ClientRendezvousPage from './components/ClientRendezvousPage'; // Assurez-vous que ce fichier existe
import ConsultantRendezvousPage from './components/ConsultantRendezvousPage'; // Assurez-vous que ce fichier existe
import ClientDocumentPage from './components/ClientDocumentPage';
import ConsultantDocumentPage from './components/ConsultantDocumentPage'; // Note: Vérifiez le chemin s'il est différent
import ConsultantBilanSynthesisPage from './components/ConsultantBilanSynthesisPage';
import './App.css';

// Composant Wrapper pour passer bilanId à ChatWindow
const ChatWindowWrapperBilan = () => {
  const { bilanId } = useParams();
  return <ChatWindow bilanId={parseInt(bilanId)} />;
};

// Composant Wrapper pour passer targetUserId à ChatWindow
const ChatWindowWrapperUser = () => {
  const { targetUserId } = useParams();
  return <ChatWindow targetUserId={parseInt(targetUserId)} />;
};

// Composant pour initier un nouveau chat client -> consultant
const ClientInitiateChat = () => {
  return (
    <div className="container mx-auto p-4 max-w-lg bg-white rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Démarrer un nouveau chat avec un consultant</h2>
      <p className="text-center text-gray-600 mb-4">Envoyez votre premier message pour initier le contact.</p>
      <ChatWindow />
    </div>
  );
};

// >>> SUPPRIMER LES DÉFINITIONS TEMPORAIRES SUIVANTES DE ClientRendezvousPage et ConsultantRendezvousPage <<<
// const ClientRendezvousPage = () => (
//   <div className="p-8 text-center bg-gray-100 min-h-screen">
//     <h1 className="text-3xl font-bold mb-4">Gestion des Rendez-vous Client</h1>
//     <p>Cette page permettra de prendre et suivre les rendez-vous.</p>
//     <Link to="/dashboard-client" className="text-blue-500 mt-4 block">Retour au tableau de bord</Link>
//   </div>
// );

// const ConsultantRendezvousPage = () => (
//   <div className="p-8 text-center bg-gray-100 min-h-screen">
//     <h1 className="text-3xl font-bold mb-4">Gestion des Rendez-vous Consultant</h1>
//     <p>Cette page permettra d'ajouter des disponibilités et confirmer les rendez-vous.</p>
//     <Link to="/dashboard-consultant" className="text-blue-500 mt-4 block">Retour au tableau de bord</Link>
//   </div>
// );
// >>> FIN DE LA SUPPRESSION <<<


function App() {
  console.log('App.js rendu');
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Routes Protégées pour les Clients */}
            <Route element={<PrivateRoute allowedRoles={['client']} />}>
              <Route path="/dashboard-client" element={<ClientDashboard />} />
              <Route path="/client/assessment" element={<AssessmentQuestionnaire />} />
              <Route path="/client/rendezvous" element={<ClientRendezvousPage />} /> {/* UTILISE LE VRAI COMPOSANT */}
              <Route path="/client/documents" element={<ClientDocumentPage />} /> {/* NOUVELLE ROUTE */}
            </Route>

            {/* Routes Protégées pour les Consultants */}
            <Route element={<PrivateRoute allowedRoles={['consultant']} />}>
              <Route path="/dashboard-consultant" element={<ConsultantDashboard />} />
              <Route path="/consultant/rendezvous" element={<ConsultantRendezvousPage />} /> {/* UTILISE LE VRAI COMPOSANT */}
              <Route path="/consultant/documents" element={<ConsultantDocumentPage />} /> {/* NOUVELLE ROUTE */}
              <Route path="/consultant/bilan/:clientId/synthesis" element={<ConsultantBilanSynthesisPage />} /> {/* <-- NOUVELLE ROUTE ICI */}
              {/* Plus tard: <Route path="/consultant/bilan/:id" element={<BilanDetails />} /> */}
            </Route>

            {/* Route Protégée pour le Chat (accessible aux clients et consultants) */}
            <Route element={<PrivateRoute allowedRoles={['client', 'consultant']} />}>
              <Route path="/chat" element={<ChatSelection />} />
              <Route path="/chat/bilan/:bilanId" element={<ChatWindowWrapperBilan />} />
              <Route path="/chat/user/:targetUserId" element={<ChatWindowWrapperUser />} />
              <Route path="/chat/initiate" element={<ClientInitiateChat />} />
            </Route>

            {/* Page d'accès non autorisé, si vous en créez une */}
            <Route path="/unauthorized" element={<div className="p-8 text-center text-red-600">Accès non autorisé !</div>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;