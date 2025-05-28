import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage'; // AJOUTEZ CETTE LIGNE
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* CHANGEZ CETTE LIGNE */}
          <Route path="/dashboard-client" element={<div className="p-8 text-center">Dashboard Client - En développement</div>} />
          <Route path="/dashboard-consultant" element={<div className="p-8 text-center">Dashboard Consultant - En développement</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;