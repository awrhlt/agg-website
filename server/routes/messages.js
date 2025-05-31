const express = require('express');
const router = express.Router();
const { Message, User, Bilan } = require('../models'); // Importez vos modèles
const { Op } = require('sequelize'); // Pour les opérateurs de Sequelize (ex: Op.or)
const { protect, authorize } = require('../middleware/authMiddleware'); // Vos middlewares d'auth

// Route pour récupérer l'historique des messages liés à un bilan
router.get('/bilan/:bilanId', protect, authorize(['client', 'consultant']), async (req, res) => {
  try {
    const { bilanId } = req.params;
    const userId = req.user.id; // L'utilisateur authentifié
    const userRole = req.user.userType;

    // Vérifier si l'utilisateur a le droit de voir cette conversation
    const bilan = await Bilan.findByPk(bilanId, {
      include: [{ model: User, as: 'Client' }, { model: User, as: 'Consultant' }]
    });

    if (!bilan) {
      return res.status(404).json({ message: 'Bilan introuvable.' });
    }

    const isClientOfBilan = bilan.Client && bilan.Client.id === userId && userRole === 'client';
    const isConsultant = userRole === 'consultant'; // Un consultant est autorisé par son rôle

    // C'EST CETTE LIGNE QUI VÉRIFIE L'ACCÈS
    // Un client ne peut voir que son bilan, un consultant peut voir tous les bilans
    if (!isClientOfBilan && !isConsultant) {
      return res.status(403).json({ message: 'Accès interdit à cette conversation. Vous n\'êtes ni le client de ce bilan, ni un consultant.' });
    }

    const messages = await Message.findAll({
      where: { bilanId: bilanId },
      order: [['timestamp', 'ASC']], // Tri par ordre chronologique
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'email', 'nom', 'prenom', 'role'] },
        { model: User, as: 'Receiver', attributes: ['id', 'email', 'nom', 'prenom', 'role'] }
      ]
    });

    res.json(messages);

  } catch (error) {
    console.error('Erreur lors de la récupération des messages du bilan:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages.' });
  }
});

// Route pour récupérer l'historique des messages entre deux utilisateurs (si non lié à un bilan)
router.get('/', protect, authorize(['client', 'consultant']), async (req, res) => {
    try {
        const { from, to } = req.query; // IDs des deux participants
        const userId = req.user.id; // L'utilisateur authentifié

        // S'assurer que l'utilisateur authentifié est l'un des participants
        if (parseInt(from) !== userId && parseInt(to) !== userId) {
            return res.status(403).json({ message: 'Accès interdit. Vous devez être l\'un des participants.' });
        }

        const messages = await Message.findAll({
            where: {
                [Op.or]: [ // Utiliser Op.or pour trouver les messages dans les deux sens
                    { senderId: from, receiverId: to },
                    { senderId: to, receiverId: from }
                ],
                bilanId: null // Messages qui ne sont pas liés à un bilan
            },
            order: [['timestamp', 'ASC']],
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'email', 'nom', 'prenom', 'role'] },
                { model: User, as: 'Receiver', attributes: ['id', 'nom', 'prenom', 'role'] }
            ]
        });
        res.json(messages);
    } catch (error) {
        console.error('Erreur lors de la récupération des messages entre utilisateurs:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// ROUTE : Récupérer tous les consultants (pour le client)
router.get('/consultants', protect, authorize(['client', 'consultant']), async (req, res) => {
  try {
    const consultants = await User.findAll({
      where: { role: 'consultant' },
      attributes: ['id', 'nom', 'prenom', 'email'] // Attributs à renvoyer
    });
    res.json(consultants);
  } catch (error) {
    console.error('Erreur lors de la récupération des consultants:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// NOUVELLE ROUTE : Récupérer tous les clients
router.get('/clients', protect, authorize(['client', 'consultant']), async (req, res) => {
  try {
    // Si c'est un client qui fait la demande, il ne devrait voir que lui-même ou les clients qui lui sont assignés
    // Pour l'instant, pour un consultant, on liste tous les clients
    // Vous pouvez affiner cette logique plus tard si un consultant ne doit voir que "ses" clients
    const clients = await User.findAll({
      where: { role: 'client' },
      attributes: ['id', 'nom', 'prenom', 'email'] // Attributs à renvoyer
    });
    res.json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});


// ROUTE POUR messageService.getUserById() : Récupérer les infos d'un utilisateur par ID
router.get('/:userId', protect, authorize(['client', 'consultant']), async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'nom', 'prenom', 'role']
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur par ID:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});


module.exports = router;