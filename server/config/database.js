const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('bilan_competences', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
  logging: false,
  dialectOptions: {
    timezone: '+00:00',
  },
  timezone: '+00:00',
  define: {
    timestamps: true,
    underscored: true, // Utilise snake_case pour les noms de colonnes
  }
});

module.exports = sequelize;