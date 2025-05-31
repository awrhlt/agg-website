// server/models/Message.js
module.exports = (sequelize, DataTypes) => { // <-- MODIFICATION ICI : Exporter une fonction
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    senderId: { // Qui a envoyé le message
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // La table User (en snake_case si underscored:true)
        key: 'id',
      },
    },
    receiverId: { // Qui est le destinataire du message (peut être null pour un chat de groupe ou initiation)
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    bilanId: { // Si le chat est lié à un bilan spécifique
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'bilans', // La table Bilan (en snake_case si underscored:true)
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: { // Date et heure de l'envoi du message
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'messages', // Nom de la table réelle dans la DB
    timestamps: true, // Gère created_at et updated_at
    createdAt: 'created_at',
    updatedAt: 'updatedAt', // <-- Correction potentielle: assurez-vous que c'est 'updatedAt' ou 'updated_at' dans votre DB
    underscored: true, // Utilise snake_case pour les noms de colonnes auto-générés
  });

  // Les associations seront définies dans index.js pour un regroupement centralisé.
  // Message.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });
  // Message.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' });
  // Message.belongsTo(Bilan, { foreignKey: 'bilanId', as: 'BilanConversation' });

  return Message; // <-- Retourner le modèle défini
};