// client/src/components/ChatWindow.js (MODIFICATIONS)
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/api';
import { useLocation } from 'react-router-dom';

const ENDPOINT = "http://localhost:5000";

const ChatWindow = ({ targetUserId, bilanId }) => {
  const { userId, isAuthenticated, userType } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [interlocutor, setInterlocutor] = useState(null);
  const [error, setError] = useState('');
  const location = useLocation();

  const isClientInitiatingChat = location.pathname === '/chat/initiate' && userType === 'client';

  useEffect(() => {
    if (!isAuthenticated || !userId || (!targetUserId && !bilanId && !isClientInitiatingChat)) {
      console.log("ChatWindow: Pas connecté, ou pas d'ID d'utilisateur cible/bilanId, ou pas sur la route d'initiation client.");
      setMessages([]);
      setInterlocutor(null);
      if (socket) socket.disconnect();
      return;
    }

    const newSocket = io(ENDPOINT, {
        auth: {
            token: localStorage.getItem('token')
        }
    });
    setSocket(newSocket);

    const fetchMessages = async () => {
        try {
            let historyResponse;
            if (bilanId) {
                historyResponse = await messageService.getMessagesByBilan(bilanId);
            } else if (targetUserId) {
                historyResponse = await messageService.getMessagesBetweenUsers(userId, targetUserId);
            } else if (isClientInitiatingChat) {
                console.log("Client Initiate Chat: Pas d'historique à charger initialement.");
                setInterlocutor({ prenom: 'Un', nom: 'Consultant', email: 'Nouveau Contact' });
                setMessages([]);
                return;
            }

            if (historyResponse) {
                setMessages(historyResponse.data);
                if (targetUserId) {
                    const user = await messageService.getUserById(targetUserId); 
                    setInterlocutor(user.data);
                } else if (bilanId && historyResponse.data.length > 0) {
                    const firstMsg = historyResponse.data[0];
                    const otherParticipantId = firstMsg.Sender.id === userId ? firstMsg.Receiver.id : firstMsg.Sender.id;
                    if (otherParticipantId) {
                        const user = await messageService.getUserById(otherParticipantId); 
                        setInterlocutor(user.data);
                    }
                } else if (bilanId && !historyResponse.data.length) {
                    console.log("Aucun historique, mais bilanId présent. Vous pouvez implémenter la récupération des participants du bilan ici.");
                }
            }

        } catch (err) {
            console.error("Erreur de chargement de l'historique du chat:", err);
            setError('Impossible de charger l\'historique des messages.');
        }
    };
    fetchMessages();

    newSocket.on('receiveMessage', (msg) => {
      const isRelevant = (bilanId && msg.bilanId === bilanId) ||
                         (targetUserId && ((msg.senderId === userId && msg.receiverId === targetUserId) ||
                                          (msg.senderId === targetUserId && msg.receiverId === userId))) ||
                         (isClientInitiatingChat && msg.senderId === userId && !msg.receiverId && !msg.bilanId); 

      if (isRelevant) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    return () => {
      console.log("ChatWindow: Déconnexion du socket lors du nettoyage du composant.");
      newSocket.disconnect();
    };
  }, [isAuthenticated, userId, targetUserId, bilanId, isClientInitiatingChat, location.pathname]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (message && socket) {
      const messageData = {
        senderId: userId,
        receiverId: targetUserId || null,
        bilanId: bilanId || null,
        content: message,
        timestamp: new Date().toISOString()
      };
      socket.emit('sendMessage', messageData);
      setMessage('');

      const tempMessageForDisplay = {
        id: Date.now(), // ID temporaire
        senderId: userId,
        receiverId: targetUserId || null,
        bilanId: bilanId || null,
        content: message,
        timestamp: messageData.timestamp,
        // Pour l'affichage immédiat, Sender n'est pas peuplé par la DB, mais on sait que c'est l'utilisateur actuel
        Sender: { id: userId, prenom: 'Vous', nom: '', email: '' } // Infos minimales pour l'affichage de "Vous"
      };
      setMessages((prevMessages) => [...prevMessages, tempMessageForDisplay]);
    }
  };

  if (!isAuthenticated) {
    return <div className="p-4 text-center text-red-500">Veuillez vous connecter pour accéder au chat.</div>;
  }
  if (!targetUserId && !bilanId && !isClientInitiatingChat) {
      return <div className="p-4 text-center text-gray-500">Sélectionnez un interlocuteur ou un bilan pour démarrer le chat.</div>;
  }
  if (error) {
      return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  // CORRECTION ICI : Construire la chaîne interlocutorName correctement avec interpolation JS
  let interlocutorName = interlocutor ? `${interlocutor.prenom} ${interlocutor.nom} (${interlocutor.email})` : 'Interlocuteur';
  if (isClientInitiatingChat && !interlocutor) {
      interlocutorName = "Nouveau Contact Consultant";
  }

  return (
    <div className="container mx-auto p-4 max-w-lg bg-white rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Conversation avec {interlocutorName}</h2>
      <div className="border rounded-lg p-4 h-64 overflow-y-auto mb-4 bg-gray-50 flex flex-col-reverse">
        {/* L'ordre des messages est inversé pour affichage du bas vers le haut */}
        {[...messages].reverse().map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.senderId === userId ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${msg.senderId === userId ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
              {msg.content}
            </span>
            {/* CORRECTION ICI : Utiliser la syntaxe correcte pour l'affichage du nom de l'expéditeur */}
            <p className="text-xs text-gray-500">
              {msg.Sender ? `${msg.Sender.prenom} ${msg.Sender.nom} (${msg.Sender.email})` : `User ${msg.senderId}`} - {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          className="flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Écrivez un message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;