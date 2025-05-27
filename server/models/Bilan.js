const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bilan = sequelize.define('Bilan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  consultant_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'en_cours', 'termine', 'suspendu'),
    defaultValue: 'en_attente'
  },
  date_debut: {
    type: DataTypes.DATE
  },
  date_fin_prevue: {
    type: DataTypes.DATE
  },
  objectifs: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'bilans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Bilan;