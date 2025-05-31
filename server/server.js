const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database'); // Importe l'instance sequelize configurée
const authRoutes = require('./routes/auth');
const bilanRoutes = require('./routes/bilans');
const messageRoutes = require('./routes/messages');
const rendezvousRoutes = require('./routes/rendezvous');
const documentsRoutes = require('./routes/documents');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); // Pour décoder le token JWT

// --- MODIFICATION CLÉ ICI : Importer les modèles depuis l'index centralisé ---
const { User, Message, Bilan, Document } = require('./models'); // Ceci importe les modèles Sequelize finaux

// L'importation simple de require('./models'); est correcte pour lancer les associations,
// mais pour utiliser les modèles ici, il faut les destructuring de l'objet exporté par index.js.
// const User = require('./models/User'); // Supprimez ou commentez cette ligne
// const Message = require('./models/Message'); // Supprimez ou commentez cette ligne
// const Bilan = require('./models/Bilan'); // Supprimez ou commentez cette ligne
// const Document = require('./models/Document'); // Supprimez ou commentez cette ligne


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Créer un serveur HTTP à partir de l'application Express (pour Socket.IO)
const server = http.createServer(app);

// Intégrer Socket.IO avec le serveur HTTP
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Autorisez votre frontend React
    methods: ["GET", "POST"]
  }
});

// --- LOGIQUE DE GESTION DES SOCKETS (CHAT) ---
io.on('connection', async (socket) => {
  console.log(`Un utilisateur est connecté (Socket.ID: ${socket.id})`);

  // 1. Authentification de l'utilisateur via le token passé dans les headers de socket
  const token = socket.handshake.auth.token;
  let userId = null;
  let userRole = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_temporaire');
      userId = decoded.userId;
      userRole = decoded.role; // Récupère le rôle du token
    } catch (error) {
      console.error("Erreur de décodage du token dans Socket.IO:", error.message);
    }
  }

  if (!userId || !userRole) {
    console.log(`Connexion Socket.IO refusée: utilisateur non authentifié ou token invalide/manquant`);
    socket.disconnect(true); // Déconnecte le socket si pas d'ID utilisateur ou rôle
    return;
  }

  console.log(`Utilisateur ID ${userId} (Rôle: ${userRole}) connecté via Socket.IO`);
  socket.userId = userId; // Attache l'ID utilisateur à l'objet socket pour un accès facile
  socket.userRole = userRole; // Attache le rôle à l'objet socket

  // 2. Joindre l'utilisateur à sa propre "room"
  // Chaque utilisateur est dans une room "user_[ID]" pour les messages privés/ciblés
  socket.join(`user_${userId}`);
  console.log(`User ${userId} a rejoint la room user_${userId}`);

  // Si c'est un consultant, le joindre à une room 'consultants_online'
  if (userRole === 'consultant') {
    socket.join('consultants_online');
    console.log(`Consultant ${userId} a rejoint la room 'consultants_online'`);
  }


  // 3. Gérer l'événement 'sendMessage' du client
  socket.on('sendMessage', async (messageData) => {
    // messageData devrait contenir { receiverId, content, bilanId (optionnel) }
    const { receiverId, content, bilanId } = messageData;
    const senderId = socket.userId; // L'expéditeur est l'utilisateur authentifié du socket
    const senderRole = socket.userRole; // Récupère le rôle de l'expéditeur

    if (!senderId || !content || (!receiverId && !bilanId && senderRole !== 'client')) {
      // Si c'est un client qui envoie sans destinataire/bilan, c'est un nouveau contact général
      if (senderRole === 'client' && !receiverId && !bilanId) {
        console.log(`Client ${senderId} envoie un message d'initiation.`);
      } else {
        console.error('Données de message invalides ou destinataire manquant:', messageData);
        return;
      }
    }

    try {
      // Enregistrer le message dans la base de données
      const newMessage = await Message.create({ // Message est maintenant le modèle Sequelize correct
        senderId,
        receiverId: receiverId || null,
        bilanId: bilanId || null,
        content,
        timestamp: new Date(),
      });

      // Récupérer les infos de l'expéditeur pour l'affichage (optionnel, mais utile)
      const senderUser = await User.findByPk(senderId, { attributes: ['id', 'email', 'nom', 'prenom', 'role'] }); // User est le modèle correct
      const receiverUser = receiverId ? await User.findByPk(receiverId, { attributes: ['id', 'email', 'nom', 'prenom', 'role'] }) : null; // User est le modèle correct


      // Format du message diffusé (inclut les infos de l'expéditeur)
      const formattedMessage = {
        id: newMessage.id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        bilanId: newMessage.bilanId,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        Sender: senderUser,
        Receiver: receiverUser,
      };

      // --- LOGIQUE DE DIFFUSION CIBLÉE ---
      if (bilanId) {
        // Si le message est lié à un bilan (conversation entre client et consultant d'un bilan)
        const bilan = await Bilan.findByPk(bilanId, { // Bilan est le modèle correct
          include: [{ model: User, as: 'Client' }, { model: User, as: 'Consultant' }]
        });

        if (bilan && bilan.Client && bilan.Consultant) {
          const clientOfBilanId = bilan.Client.id;
          const consultantOfBilanId = bilan.Consultant.id;

          // Envoyer le message aux deux participants de la conversation liée au bilan
          io.to(`user_${clientOfBilanId}`).emit('receiveMessage', formattedMessage);
          io.to(`user_${consultantOfBilanId}`).emit('receiveMessage', formattedMessage);
          console.log(`Message pour bilan ${bilanId} diffusé entre client ${clientOfBilanId} et consultant ${consultantOfBilanId}`);
        } else {
          console.warn(`Bilan ${bilanId} ou ses participants introuvables. Message diffusé globalement (fallback).`);
          io.emit('receiveMessage', formattedMessage); // Fallback si le bilan n'est pas trouvé
        }
      } else if (receiverId) {
        // Chat direct entre deux utilisateurs (client et consultant)
        io.to(`user_${senderId}`).emit('receiveMessage', formattedMessage); // Envoie à l'expéditeur lui-même
        io.to(`user_${receiverId}`).emit('receiveMessage', formattedMessage); // Envoie au destinataire
        console.log(`Message privé de ${senderId} à ${receiverId} diffusé.`);
      } else if (senderRole === 'client') {
        // NOUVEAU CAS : Client envoie un message à un consultant non spécifié (initiation)
        // Envoyer à tous les consultants connectés dans la room 'consultants_online'
        io.to('consultants_online').emit('receiveMessage', formattedMessage);
        console.log(`Message du client ${senderId} diffusé à tous les consultants connectés.`);
      } else {
        // Cas de fallback si ni receiverId ni bilanId ni rôle client émetteur.
        console.warn('Message sans destinataire précis ni bilanId ni rôle client émetteur. Diffusion globale (fallback).');
        io.emit('receiveMessage', formattedMessage);
      }

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement ou de la diffusion du message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Utilisateur ID ${socket.userId} (Rôle: ${socket.userRole}) déconnecté (Socket.ID: ${socket.id})`);
    socket.leave(`user_${socket.userId}`);
    if (socket.userRole === 'consultant') {
      socket.leave('consultants_online'); // Retire le consultant de la room quand il se déconnecte
      console.log(`Consultant ${socket.userId} a quitté la room 'consultants_online'`);
    }
  });
});

app.use('/uploads', express.static('uploads'));

// Routes Express
app.use('/api/auth', authRoutes);
app.use('/api/bilans', bilanRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rendezvous', rendezvousRoutes);
app.use('/api/documents', documentsRoutes);
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connecté!' });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion MySQL réussie');

    // Si vous avez ajouté de nouvelles colonnes récemment et que les tables ne sont pas à jour,
    // vous devrez peut-être TEMPORAIREMENT utiliser { force: true } une fois, puis le retirer.
    await sequelize.sync();
    console.log('Tables créées (ou synchronisées)');

    server.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`API disponible sur http://localhost:${PORT}`);
      console.log(`Auth: POST /api/auth/register | POST /api/auth/login`);
      console.log(`Bilans: GET /api/bilans/client/:id | POST /api/bilans`);
      console.log(`Chat: WebSocket activé sur ws://localhost:${PORT}`);
    });

  } catch (error) {
    console.error(' ATTENTION : Erreur de démarrage du serveur:', error);
  }
};

startServer();