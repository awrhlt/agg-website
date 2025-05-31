// client/src/components/ConsultantBilanSynthesisPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bilanService } from '../services/api'; // Service pour appeler la nouvelle route de synthèse

const ConsultantBilanSynthesisPage = () => {
  const { clientId } = useParams(); // Récupère le clientId depuis l'URL
  const [synthesisData, setSynthesisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendFeedback, setSendFeedback] = useState(''); // Nouveau state pour le feedback d'envoi

  // Définition des thèmes pour l'affichage (doit correspondre à la logique backend)
  const themesOrder = [
    { id: 'competences_techniques', title: 'Compétences techniques' },
    { id: 'competences_transversales', title: 'Compétences transversales' },
    { id: 'qualites_personnelles', title: 'Qualités personnelles' },
    { id: 'motivations_valeurs', title: 'Motivations et valeurs' },
    { id: 'interets_professionnels', title: 'Intérêts professionnels' },
  ];

  useEffect(() => {
    const fetchSynthesis = async () => {
      try {
        const response = await bilanService.getBilanSynthesis(clientId);
        setSynthesisData(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Erreur chargement synthèse bilan:', err.response ? err.response.data : err);
        setError(err.response?.data?.message || 'Impossible de charger la synthèse du bilan.');
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchSynthesis();
    }
  }, [clientId]);

  const handleSendSynthesis = async () => {
    setSendFeedback(''); // Réinitialise le message
    try {
      // Appelle la nouvelle méthode de service pour envoyer la synthèse
      const response = await bilanService.sendBilanSynthesis(clientId); // <-- NOUVEL APPEL
      setSendFeedback(response.data.message);
    } catch (err) {
      setSendFeedback(err.response?.data?.message || 'Erreur lors de l\'envoi de la synthèse.');
      console.error('Erreur envoi synthèse:', err.response ? err.response.data : err);
    }
  };


  if (isLoading) {
    return <div className="p-8 text-center">Chargement de la synthèse...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (!synthesisData) {
    return <div className="p-8 text-center text-gray-600">Aucune donnée de synthèse disponible.</div>;
  }

  const { clientInfo, bilanSummaries, overallSynthesis, evolutionData } = synthesisData;

  // Préparer les données pour un graphique simple d'évolution (si besoin plus tard)
  const evolutionChartData = {
    labels: bilanSummaries.map(b => new Date(b.submissionDate).toLocaleDateString()),
    datasets: themesOrder.map(theme => ({
      label: theme.title,
      data: evolutionData[theme.id] ? evolutionData[theme.id].map(dataPoint => dataPoint.score.toFixed(1)) : [],
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      fill: false,
    }))
  };

  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Synthèse du Bilan de Compétences</h1>

      {clientInfo && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Client : {clientInfo.prenom} {clientInfo.nom}</h2>
          <p className="text-gray-600">Email : {clientInfo.email}</p>
          <p className="text-gray-600">Nombre de bilans soumis : {bilanSummaries.length}</p>
        </div>
      )}

      {/* Bouton pour envoyer la synthèse */}
      <div className="text-center mb-8">
        <button
          onClick={handleSendSynthesis}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
        >
          Envoyer la Synthèse au Client
        </button>
        {sendFeedback && (
          <p className="mt-4 text-sm font-medium text-center text-green-600">{sendFeedback}</p>
        )}
      </div>


      {/* Synthèse globale du dernier bilan */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Synthèse Générale (Dernier Bilan)</h2>
        <p className="whitespace-pre-line text-gray-700 leading-relaxed">{overallSynthesis}</p>
      </div>

      {/* Détails des scores par thème du dernier bilan */}
      {bilanSummaries.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Scores détaillés (Dernier Bilan)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themesOrder.map(theme => {
              const score = synthesisData.bilanSummaries[synthesisData.bilanSummaries.length - 1]?.scores[theme.id];
              let scoreColor = 'text-gray-700';
              if (score >= 4) scoreColor = 'text-green-600';
              else if (score >= 3) scoreColor = 'text-yellow-600';
              else if (score >= 1) scoreColor = 'text-red-600';

              return (
                <div key={theme.id} className="p-4 border rounded-lg bg-gray-50">
                  <p className="font-semibold text-lg">{theme.title}</p>
                  <p className={`text-xl font-bold ${scoreColor}`}>Score moyen : {score !== undefined ? score.toFixed(1) : 'N/A'}/5</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section Suivi d'évolution (si plusieurs bilans) */}
      {bilanSummaries.length > 1 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Suivi d'Évolution des Scores</h2>
          <p className="text-gray-600 mb-4">Évolution des scores moyens par thème au fil des soumissions de bilans.</p>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-sm text-sm">
              <thead>
                <tr className="bg-blue-50 text-left text-gray-600 uppercase text-xs leading-normal">
                  <th className="py-2 px-4">Date Bilan</th>
                  {themesOrder.map(theme => <th key={theme.id} className="py-2 px-4">{theme.title}</th>)}
                </tr>
              </thead>
              <tbody>
                {bilanSummaries.map(summary => (
                  <tr key={summary.bilanId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4">{new Date(summary.submissionDate).toLocaleDateString()}</td>
                    {themesOrder.map(theme => (
                      <td key={theme.id} className="py-2 px-4">
                        {summary.scores[theme.id] !== undefined ? summary.scores[theme.id].toFixed(1) : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lien de retour */}
      <div className="mt-8 text-center">
        <Link to="/dashboard-consultant" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200">
          Retour au Tableau de Bord Consultant
        </Link>
      </div>
    </div>
  );
};

export default ConsultantBilanSynthesisPage;