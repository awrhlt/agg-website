const express = require('express');
const router = express.Router();
const { User, RendezVous } = require('../models'); // Importez vos modèles
const { protect, authorize } = require('../middleware/authMiddleware'); // Vos middlewares d'auth
const { Op } = require('sequelize'); // Pour les opérateurs de Sequelize

// ROUTE 1: POST /api/rendezvous/disponibilites - Consultant: Ajouter une disponibilité
router.post('/disponibilites', protect, authorize(['consultant']), async (req, res) => {
  try {
    const consultantId = req.user.id;
    const { date, heure } = req.body; // Date et heure de la disponibilité

    // Vérifiez si la disponibilité existe déjà
    const existing = await RendezVous.findOne({
      where: { consultantId, date, heure, statut: 'disponible' }
    });
    if (existing) {
      return res.status(400).json({ message: 'Cette disponibilité existe déjà.' });
    }

    const newRendezVous = await RendezVous.create({
      consultantId,
      date,
      heure,
      statut: 'disponible' // Statut par défaut
    });
    res.status(201).json({ message: 'Disponibilité ajoutée avec succès', rendezVous: newRendezVous });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une disponibilité:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ROUTE 2: GET /api/rendezvous/disponibilites - Client: Voir toutes les disponibilités (ou d'un consultant spécifique)
router.get('/disponibilites', protect, authorize(['client', 'consultant']), async (req, res) => {
  try {
    const { consultantId } = req.query; // Optionnel: filtrer par consultant

    let whereClause = { statut: 'disponible' };
    if (consultantId) {
      whereClause.consultantId = consultantId;
    }

    const disponibilites = await RendezVous.findAll({
      where: whereClause,
      include: [{ model: User, as: 'Consultant', attributes: ['id', 'nom', 'prenom', 'email'] }],
      order: [['date', 'ASC'], ['heure', 'ASC']]
    });
    res.json(disponibilites);
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ROUTE 3: POST /api/rendezvous/demande - Client: Demander un rendez-vous
router.post('/demande', protect, authorize(['client']), async (req, res) => {
  try {
    const clientId = req.user.id;
    const { rendezVousId, motif } = req.body; // ID de la disponibilité et motif de la demande

    const rendezVous = await RendezVous.findByPk(rendezVousId);

    if (!rendezVous) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé.' });
    }
    if (rendezVous.statut !== 'disponible') {
      return res.status(400).json({ message: 'Ce créneau n\'est plus disponible.' });
    }

    await rendezVous.update({
      clientId,
      motif,
      statut: 'demandé' // Passe au statut 'demandé'
    });
    res.json({ message: 'Demande de rendez-vous envoyée', rendezVous });
  } catch (error) {
    console.error('Erreur lors de la demande de rendez-vous:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ROUTE 4: PUT /api/rendezvous/:rendezVousId/confirmation - Consultant: Confirmer/Annuler un rendez-vous
router.put('/:rendezVousId/confirmation', protect, authorize(['consultant']), async (req, res) => {
  try {
    const { rendezVousId } = req.params;
    const consultantId = req.user.id;
    const { statut } = req.body; // 'confirmé' ou 'annulé'

    const rendezVous = await RendezVous.findByPk(rendezVousId);

    if (!rendezVous) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé.' });
    }
    if (rendezVous.consultantId !== consultantId) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à confirmer ce rendez-vous.' });
    }
    if (rendezVous.statut !== 'demandé' && statut === 'confirmé') {
        return res.status(400).json({ message: 'Ce rendez-vous ne peut être confirmé.' });
    }
    if (rendezVous.statut === 'confirmé' && statut === 'annulé') {
        // Permettre l'annulation d'un rdv confirmé
    } else if (rendezVous.statut !== 'demandé' && statut === 'annulé') {
        return res.status(400).json({ message: 'Ce rendez-vous ne peut être annulé à ce stade.' });
    }

    await rendezVous.update({ statut });
    res.json({ message: `Rendez-vous ${statut} avec succès`, rendezVous });
  } catch (error) {
    console.error('Erreur lors de la confirmation/annulation de rendez-vous:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ROUTE 5: GET /api/rendezvous/client - Client: Voir ses propres rendez-vous (demandés, confirmés, à venir)
router.get('/client', protect, authorize(['client']), async (req, res) => {
    try {
        const clientId = req.user.id;
        const rendezVousClient = await RendezVous.findAll({
            where: { clientId },
            include: [{ model: User, as: 'Consultant', attributes: ['id', 'nom', 'prenom', 'email'] }],
            order: [['date', 'ASC'], ['heure', 'ASC']]
        });
        res.json(rendezVousClient);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous du client:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// ROUTE 6: GET /api/rendezvous/consultant - Consultant: Voir ses propres rendez-vous (disponibles, demandés, confirmés)
router.get('/consultant', protect, authorize(['consultant']), async (req, res) => {
    try {
        const consultantId = req.user.id;
        const rendezVousConsultant = await RendezVous.findAll({
            where: { consultantId },
            include: [{ model: User, as: 'Client', attributes: ['id', 'nom', 'prenom', 'email'] }],
            order: [['date', 'ASC'], ['heure', 'ASC']]
        });
        res.json(rendezVousConsultant);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous du consultant:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});


module.exports = router;