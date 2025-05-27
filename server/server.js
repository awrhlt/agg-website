const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const bilanRoutes = require('./routes/bilans');

// Importer les modèles avec leurs relations
require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bilans', bilanRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connecté!' });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion MySQL réussie');
    
    await sequelize.sync({ force: true }); 
    console.log('Tables créées');
    
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`API disponible sur http://localhost:${PORT}`);
      console.log(`Auth: POST /api/auth/register | POST /api/auth/login`);
      console.log(`Bilans: GET /api/bilans/client/:id | POST /api/bilans`);
    });
    
  } catch (error) {
    console.error(' ATTENTION : Erreur de démarrage:', error);
  }
};

startServer();