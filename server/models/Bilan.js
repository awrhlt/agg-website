// server/models/Bilan.js
module.exports = (sequelize, DataTypes) => {
  const Bilan = sequelize.define('Bilan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    consultant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    responses: {
      type: DataTypes.JSON,
      allowNull: false
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    statut: {
      type: DataTypes.ENUM('draft', 'submitted', 'in_review', 'completed', 'suspended'), // <-- MODIFICATION ICI : Ajout de 'draft'
      defaultValue: 'draft' // <-- MODIFICATION OPTIONNELLE : Le défaut peut être 'draft'
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: true
    },
    date_fin_prevue: {
      type: DataTypes.DATE,
      allowNull: true
    },
    objectifs: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'bilans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return Bilan;
};