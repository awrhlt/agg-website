const express = require('express');
const { Bilan, User } = require('../models');
const router = express.Router();

router.get('/client/:clientId', async (req, res) => {
  try {
    const bilans = await Bilan.findAll({
      where: { client_id: req.params.clientId },
      include: [
        { model: User, as: 'consultant', attributes: ['nom', 'prenom', 'email'] }
      ]
    });
    res.json(bilans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { client_id, titre, description, objectifs } = req.body;
    
    const bilan = await Bilan.create({
      client_id,
      titre,
      description,
      objectifs,
      statut: 'en_attente'
    });
    
    res.status(201).json({ 
      message: 'Bilan créé avec succès',
      bilan 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;