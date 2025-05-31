// server/models/Document.js
module.exports = (sequelize, DataTypes) => { // <-- MODIFICATION ICI
    const Document = sequelize.define('Document', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      clientId: { // Le client à qui appartient le document
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      consultantId: { // Le consultant qui a peut-être téléversé ou est lié au doc
        type: DataTypes.INTEGER,
        allowNull: true, // Peut être null
        references: {
          model: 'users',
          key: 'id',
        },
      },
      bilanId: { // Si le document est lié à un bilan spécifique
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'bilans',
          key: 'id',
        },
      },
      fileName: { // Nom original du fichier
        type: DataTypes.STRING,
        allowNull: false,
      },
      filePath: { // Chemin où le fichier est stocké sur le serveur (ou URL cloud)
        type: DataTypes.STRING,
        allowNull: false,
      },
      fileType: { // Type MIME du fichier (ex: 'application/pdf', 'image/jpeg')
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: { // Courte description du document
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Ajoutez d'autres champs si nécessaire (ex: taille du fichier, tags)
    }, {
      tableName: 'documents', // Nom de la table réelle dans la DB
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true, // Utilise snake_case pour les noms de colonnes
    });
  
    // Ces associations seront définies dans index.js
    // Document.belongsTo(User, { foreignKey: 'clientId', as: 'Client' });
    // Document.belongsTo(User, { foreignKey: 'consultantId', as: 'Consultant' });
    // Document.belongsTo(Bilan, { foreignKey: 'bilanId', as: 'Bilan' });
  
    return Document; // <-- Retourner le modèle défini
  };