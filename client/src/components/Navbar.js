import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-left">
          <h1>Bilans de Compétences</h1>
        </div>
        
        <div className="nav-right">
          <span className="user-info">
            {user.prenom} {user.nom} ({user.role})
          </span>
          <button onClick={onLogout} className="logout-btn">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;