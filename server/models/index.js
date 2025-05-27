const User = require('./User');
const Bilan = require('./Bilan');

// Relations entre User et Bilan
User.hasMany(Bilan, { 
  foreignKey: 'client_id', 
  as: 'bilansClient' 
});

User.hasMany(Bilan, { 
  foreignKey: 'consultant_id', 
  as: 'bilansConsultant' 
});

Bilan.belongsTo(User, { 
  foreignKey: 'client_id', 
  as: 'client' 
});

Bilan.belongsTo(User, { 
  foreignKey: 'consultant_id', 
  as: 'consultant' 
});

module.exports = {
  User,
  Bilan
};