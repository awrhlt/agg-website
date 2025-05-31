// server/models/index.js
const { Sequelize } = require('sequelize');
// Assurez-vous que cette ligne pointe vers l'instance de Sequelize configurée
// Si vous avez un fichier database.js qui exporte sequelize, utilisez-le.
// Sinon, vous devez l'initialiser ici :
const sequelize = require('../config/database'); 

// Importez chaque modèle en lui passant l'instance sequelize et DataTypes
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Bilan = require('./Bilan')(sequelize, Sequelize.DataTypes);
const Message = require('./Message')(sequelize, Sequelize.DataTypes);
const RendezVous = require('./RendezVous')(sequelize, Sequelize.DataTypes);
const Document = require('./Document')(sequelize, Sequelize.DataTypes); // <-- CORRECTION ICI

// Relations entre User et Bilan (Client)
// Un utilisateur (User) peut avoir plusieurs bilans en tant que CLIENT
User.hasMany(Bilan, {
  foreignKey: 'client_id', // DOIT CORRESPONDRE À client_id DANS BILAN.JS
  as: 'ClientBilans',      // Alias pour l'association User -> Bilan (côté User.hasMany)
  sourceKey: 'id'          // Clé primaire du modèle User
});
// Un bilan (Bilan) appartient à un utilisateur (User) en tant que CLIENT
Bilan.belongsTo(User, {
  foreignKey: 'client_id', // DOIT CORRESPONDRE À client_id DANS BILAN.JS
  as: 'Client',            // Alias pour l'association Bilan -> User (côté Bilan.belongsTo)
  targetKey: 'id'          // Clé primaire du modèle User
});

// Relations entre User et Bilan (Consultant)
// Un utilisateur (User) peut être le consultant de plusieurs bilans
User.hasMany(Bilan, {
  foreignKey: 'consultant_id', // DOIT CORRESPONDRE À consultant_id DANS BILAN.JS
  as: 'ConsultantBilans',      // Alias pour l'association User -> Bilan (côté User.hasMany)
  sourceKey: 'id'
});
// Un bilan (Bilan) appartient à un utilisateur (User) en tant que CONSULTANT
Bilan.belongsTo(User, {
  foreignKey: 'consultant_id', // DOIT CORRESPONDRE À consultant_id DANS BILAN.JS
  as: 'Consultant',            // Alias pour l'association Bilan -> User (côté Bilan.belongsTo)
  targetKey: 'id'
});

// Associations pour Message
User.hasMany(Message, { foreignKey: 'senderId', as: 'SentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'ReceivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' });
Message.belongsTo(Bilan, { foreignKey: 'bilanId', as: 'BilanConversation' });

// --- NOUVELLES ASSOCIATIONS POUR RENDEZVOUS ---
// Un consultant (User) peut avoir plusieurs rendez-vous créés
User.hasMany(RendezVous, { foreignKey: 'consultantId', as: 'ConsultantRendezvous' });
// Un client (User) peut avoir plusieurs rendez-vous demandés
User.hasMany(RendezVous, { foreignKey: 'clientId', as: 'ClientRendezvous' });

// Un rendez-vous est proposé par un consultant
RendezVous.belongsTo(User, { foreignKey: 'consultantId', as: 'Consultant' });
// Un rendez-vous est pris par un client
RendezVous.belongsTo(User, { foreignKey: 'clientId', as: 'Client' });

// --- NOUVELLES ASSOCIATIONS POUR DOCUMENT ---
// Un client (User) peut téléverser plusieurs documents
User.hasMany(Document, { foreignKey: 'clientId', as: 'ClientDocuments' });
// Un consultant (User) peut être lié à plusieurs documents
User.hasMany(Document, { foreignKey: 'consultantId', as: 'ConsultantDocuments' });
// Un bilan (Bilan) peut avoir plusieurs documents associés
Bilan.hasMany(Document, { foreignKey: 'bilanId', as: 'BilanDocuments' });

// Un document appartient à un client
Document.belongsTo(User, { foreignKey: 'clientId', as: 'Client' });
// Un document peut être lié à un consultant
Document.belongsTo(User, { foreignKey: 'consultantId', as: 'Consultant' });
// Un document peut être lié à un bilan
Document.belongsTo(Bilan, { foreignKey: 'bilanId', as: 'Bilan' });

module.exports = {
  sequelize, // Exporter l'instance sequelize
  User,
  Bilan,
  Message,
  RendezVous,
  Document
};