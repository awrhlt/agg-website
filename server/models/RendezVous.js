// server/models/RendezVous.js
module.exports = (sequelize, DataTypes) => { // <-- MODIFICATION ICI : Exporter une fonction
  const RendezVous = sequelize.define('RendezVous', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    consultantId: { // Le consultant qui propose ou est assigné au RDV
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Nom de la table User
        key: 'id',
      },
    },
    clientId: { // Le client qui a demandé ou est assigné au RDV
      type: DataTypes.INTEGER,
      allowNull: true, // Peut être null si c'est juste une disponibilité non encore prise
      references: {
        model: 'users',
        key: 'id',
      },
    },
    date: { // Date du rendez-vous
      type: DataTypes.DATEONLY, // Juste la date (ex: 'YYYY-MM-DD')
      allowNull: false,
    },
    heure: { // Heure du rendez-vous
      type: DataTypes.TIME, // Juste l'heure (ex: 'HH:MM:SS')
      allowNull: false,
    },
    statut: { // Statut du rendez-vous
      type: DataTypes.ENUM('disponible', 'demandé', 'confirmé', 'annulé'),
      defaultValue: 'disponible',
    },
    motif: { // Motif de la demande de RDV (par le client)
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Ajoutez d'autres champs si nécessaire (ex: duree, lien_visio, etc.)
  }, {
    tableName: 'rendezvous', // Nom de la table réelle dans la DB
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true, // Utilise snake_case pour les noms de colonnes
  });

  // Les associations sont définies dans index.js
  // RendezVous.belongsTo(User, { foreignKey: 'consultantId', as: 'Consultant' });
  // RendezVous.belongsTo(User, { foreignKey: 'clientId', as: 'Client' });

  return RendezVous; // <-- Retourner le modèle défini
};