const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // <-- MODIFICATION CLÉ ICI : Importe le modèle User depuis l'index des modèles
const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, nom, prenom, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    // User est maintenant le modèle Sequelize correct
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // hash mdp

    const user = await User.create({
      email,
      password: hashedPassword,
      nom,
      prenom,
      role: role || 'client'
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // User est maintenant le modèle Sequelize correct
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'secret_key_temporaire', // À changer en production ????
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;