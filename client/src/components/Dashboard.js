import React, { useState, useEffect } from 'react';
import { bilanService } from '../services/api';

const Dashboard = ({ user }) => {
  const [bilans, setBilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBilan, setNewBilan] = useState({
    titre: '',
    description: '',
    objectifs: ''
  });

  // Charger les bilans du client
  useEffect(() => {
    if (user.role === 'client') {
      loadBilans();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadBilans = async () => {
    try {
      const response = await bilanService.getBilansClient(user.id);
      setBilans(response.data);
    } catch (error) {
      setError('Erreur lors du chargement des bilans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBilan = async (e) => {
    e.preventDefault();
    try {
      await bilanService.createBilan({
        ...newBilan,
        client_id: user.id
      });
      
      setNewBilan({ titre: '', description: '', objectifs: '' });
      setShowCreateForm(false);
      loadBilans(); // Recharger la liste
    } catch (error) {
      setError('Erreur lors de la création du bilan');
    }
  };

  const handleChange = (e) => {
    setNewBilan({
      ...newBilan,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Tableau de bord</h2>
        <p>Bienvenue, {user.prenom} !</p>
      </div>

      {user.role === 'client' ? (
        <div className="client-dashboard">
          <div className="section">
            <div className="section-header">
              <h3>Mes Bilans de Compétences</h3>
              <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary"
              >
                + Nouveau Bilan
              </button>
            </div>

            {error && <div className="error">{error}</div>}

            {showCreateForm && (
              <div className="create-form">
                <h4>Créer un nouveau bilan</h4>
                <form onSubmit={handleCreateBilan}>
                  <div className="form-group">
                    <label>Titre :</label>
                    <input
                      type="text"
                      name="titre"
                      value={newBilan.titre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description :</label>
                    <textarea
                      name="description"
                      value={newBilan.description}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Objectifs :</label>
                    <textarea
                      name="objectifs"
                      value={newBilan.objectifs}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Créer</button>
                    <button 
                      type="button" 
                      onClick={() => setShowCreateForm(false)}
                      className="btn-secondary"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bilans-list">
              {bilans.length === 0 ? (
                <p>Aucun bilan de compétences pour le moment.</p>
              ) : (
                bilans.map((bilan) => (
                  <div key={bilan.id} className="bilan-card">
                    <h5>{bilan.titre}</h5>
                    <p><strong>Statut :</strong> {bilan.statut}</p>
                    <p><strong>Description :</strong> {bilan.description}</p>
                    {bilan.objectifs && (
                      <p><strong>Objectifs :</strong> {bilan.objectifs}</p>
                    )}
                    <small>Créé le {new Date(bilan.created_at).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="consultant-dashboard">
          <h3>Espace Consultant</h3>
          <p>Fonctionnalités consultant à venir...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;