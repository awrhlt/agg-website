const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // Assurez-vous que process.env.JWT_SECRET est défini dans votre .env ou directement dans le code pour le développement
      // N'utilisez PAS 'secret_key_temporaire' en production
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_temporaire'); 

      // Attacher l'utilisateur décodé à la requête
      // Assurez-vous que votre JWT contient id, email, et userType (ou 'role' si c'est le nom dans le token)
      req.user = { 
        id: decoded.userId, 
        email: decoded.email, 
        userType: decoded.role // Utilisez 'role' si c'est le nom dans votre token JWT
      }; 

      next();
    } catch (error) {
      console.error('Erreur de vérification du token:', error.message);
      res.status(401).json({ message: 'Non autorisé, token invalide ou expiré' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Non autorisé, pas de token fourni' });
  }
};

const authorize = (roles = []) => {
  // roles est un tableau de rôles autorisés (ex: ['client', 'consultant'])
  return (req, res, next) => {
    if (!req.user || !req.user.userType || (roles.length > 0 && !roles.includes(req.user.userType))) {
      return res.status(403).json({ message: 'Accès interdit: rôle insuffisant' });
    }
    next();
  };
};

module.exports = { protect, authorize };