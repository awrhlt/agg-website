// server/routes/documents.js
const express = require('express');
const router = express.Router();
const multer = require('multer'); // Importe multer
const path = require('path'); // Module Node.js pour gérer les chemins de fichiers
const fs = require('fs'); // Module Node.js pour le système de fichiers (pour la suppression)
const { User, Document, Bilan } = require('../models'); // Importe les modèles
const { protect, authorize } = require('../middleware/authMiddleware'); // Vos middlewares d'auth

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads'); // Chemin vers le dossier 'server/uploads'
    fs.mkdirSync(uploadPath, { recursive: true }); // Crée le dossier si non existant
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Renomme le fichier pour éviter les conflits (ex: 'fichier-original-timestamp.ext')
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ROUTE 1: POST /api/documents/upload - Client: Téléverser un document
// Un client peut téléverser un document qui lui est propre
router.post('/upload', protect, authorize(['client', 'consultant']), upload.single('document'), async (req, res) => {
  try {
    const clientId = req.user.id; // L'utilisateur authentifié est le client
    const consultantId = req.body.consultantId || null; // Peut être assigné à un consultant
    const bilanId = req.body.bilanId || null; // Peut être lié à un bilan
    const description = req.body.description || null; // Description du document

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été téléversé.' });
    }

    const newDocument = await Document.create({
      clientId: clientId,
      consultantId: consultantId,
      bilanId: bilanId,
      fileName: req.file.originalname,
      filePath: req.file.path, // Chemin local du fichier sur le serveur
      fileType: req.file.mimetype,
      description: description,
    });

    res.status(201).json({ message: 'Document téléversé avec succès', document: newDocument });

  } catch (error) {
    console.error('Erreur lors du téléversement du document:', error);
    res.status(500).json({ message: 'Erreur serveur lors du téléversement du document.' });
  }
});

// ROUTE 2: GET /api/documents/client/:clientId - Client: Voir ses propres documents
// Consultant: Voir les documents de ses clients
router.get('/client/:clientId', protect, authorize(['client', 'consultant']), async (req, res) => {
  try {
    const clientIdFromParams = req.params.clientId;
    const userId = req.user.id;
    const userRole = req.user.userType;

    // Vérifier l'autorisation :
    // - Si c'est un client, il doit être le client demandé
    // - Si c'est un consultant, il peut voir les documents de TOUS les clients (ou seulement les siens)
    if (userRole === 'client' && parseInt(clientIdFromParams) !== userId) {
      return res.status(403).json({ message: 'Accès interdit. Vous ne pouvez voir que vos propres documents.' });
    }
    // Pour le consultant, on autorise l'accès s'il est consultant, sans vérifier clientId spécifique ici
    // Une logique plus fine pourrait vérifier si le consultant est assigné à ce client/bilan.

    const documents = await Document.findAll({
      where: { clientId: clientIdFromParams },
      include: [
        { model: User, as: 'Client', attributes: ['id', 'nom', 'prenom', 'email'] },
        { model: User, as: 'Consultant', attributes: ['id', 'nom', 'prenom', 'email'] },
        { model: Bilan, as: 'Bilan', attributes: ['id', 'statut'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents du client:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ROUTE 3: GET /api/documents/download/:documentId - Télécharger un document
router.get('/download/:documentId', protect, authorize(['client', 'consultant']), async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.userType;

    const document = await Document.findByPk(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }

    // Vérification d'autorisation pour le téléchargement
    if (userRole === 'client' && document.clientId !== userId) {
      return res.status(403).json({ message: 'Accès interdit. Ce document ne vous appartient pas.' });
    }
    // Un consultant peut télécharger tous les documents
    // Une logique plus fine pourrait être: si userRole === 'consultant' alors il doit être assigné au client/bilan

    res.download(document.filePath, document.fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier:', err);
        res.status(500).json({ message: 'Erreur lors du téléchargement du fichier.' });
      }
    });
  } catch (error) {
    console.error('Erreur lors de la préparation du téléchargement:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ROUTE 4: DELETE /api/documents/:documentId - Supprimer un document
router.delete('/:documentId', protect, authorize(['client', 'consultant']), async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.userType;

    const document = await Document.findByPk(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }

    // Vérification d'autorisation pour la suppression
    if (userRole === 'client' && document.clientId !== userId) {
      return res.status(403).json({ message: 'Accès interdit. Ce document ne vous appartient pas.' });
    }
    // Les consultants peuvent supprimer tous les documents (ou seulement les leurs/ceux des clients qu'ils gèrent)

    // Supprimer le fichier du système de fichiers
    fs.unlink(document.filePath, async (err) => {
      if (err) {
        console.error('Erreur lors de la suppression physique du fichier:', err);
        // Gérer l'erreur mais tenter de supprimer l'entrée DB quand même si le fichier est déjà parti
      }

      // Supprimer l'entrée de la base de données
      await document.destroy();
      res.json({ message: 'Document supprimé avec succès.' });
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});


module.exports = router;