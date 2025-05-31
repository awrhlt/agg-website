// server/models/User.js
module.exports = (sequelize, DataTypes) => { // <-- MODIFICATION ICI : 'sequelize' et 'DataTypes' sont les arguments
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('client', 'consultant'),
      defaultValue: 'client'
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  return User; // <-- Retourne le modèle User défini
};