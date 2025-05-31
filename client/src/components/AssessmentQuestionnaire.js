// client/src/components/AssessmentQuestionnaire.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bilanService } from '../services/api';
import { useAuth } from '../context/AuthContext'; // Importez useAuth

// Déplacer les définitions statiques en dehors du composant
const themes = [
  {
    id: 'competences_techniques',
    title: 'Compétences techniques (savoirs, savoir-faire) issues des expériences passées',
    questions: [
      { id: 'dev_web_frontend', text: 'Maîtrise du développement web (frontend, ex: React, Angular, Vue.js)' },
      { id: 'dev_web_backend', text: 'Maîtrise du développement web (backend, ex: Node.js, Python, PHP)' },
      { id: 'bases_de_donnees', text: 'Compétences en bases de données (SQL, NoSQL)' },
      { id: 'gestion_projets_tech', text: 'Gestion de projets techniques ou méthodologies Agiles' },
      { id: 'outils_devops', text: 'Familiarité avec les outils DevOps (Git, Docker, CI/CD)' },
    ]
  },
  {
    id: 'competences_transversales',
    title: 'Compétences transversales',
    questions: [
      { id: 'communication_ecrite', text: 'Qualité de la communication écrite (rapports, e-mails)' },
      { id: 'communication_orale', text: 'Qualité de la communication orale (présentations, réunions)' },
      { id: 'gestion_stress', text: 'Capacité à gérer le stress et la pression' },
      { id: 'travail_equipe', text: 'Capacité à travailler efficacement en équipe' },
      { id: 'resolution_problemes', text: 'Compétences en résolution de problèmes complexes' },
    ]
  },
  {
    id: 'qualites_personnelles',
    title: 'Qualités personnelles',
    questions: [
      { id: 'autonomie', text: 'Niveau d\'autonomie et d\'initiative' },
      { id: 'creativite', text: 'Capacité à faire preuve de créativité et d\'innovation' },
      { id: 'rigueur', text: 'Niveau de rigueur et d\'attention aux détails' },
      { id: 'adaptabilite', text: 'Capacité d\'adaptation au changement' },
      { id: 'organisation', text: 'Sens de l\'organisation et de la planification' },
    ]
  },
  {
    id: 'motivations_valeurs',
    title: 'Motivations et valeurs professionnelles',
    questions: [
      { id: 'apprentissage_continu', text: 'Motivation pour l\'apprentissage continu et le développement de compétences' },
      { id: 'impact_social', text: 'Importance de l\'impact social ou environnemental dans mon travail' },
      { id: 'reconnaissance', text: 'Niveau d\'importance de la reconnaissance professionnelle' },
      { id: 'equilibre_vie', text: 'Importance de l\'équilibre entre vie pro. et perso.' },
      { id: 'remuneration', text: 'Importance de la rémunération et des avantages' },
    ]
  },
  {
    id: 'interets_professionnels',
    title: 'Intérêts professionnels (secteurs, types de missions préférées)',
    questions: [
      { id: 'secteur_prefere', text: 'Intérêt pour le secteur technologique' },
      { id: 'type_mission_prefere', text: 'Préférence pour les missions axées sur la création ou l\'optimisation' },
      { id: 'environnement_travail', text: 'Préférence pour un environnement de travail collaboratif ou indépendant' },
      { id: 'responsabilites_management', text: 'Intérêt pour des responsabilités de management ou de leadership' },
      { id: 'innovation_recherche', text: 'Intérêt pour l\'innovation et la recherche et développement' },
    ]
  },
];

const scaleOptions = [
  { value: 1, label: '1 - Très faible / Pas du tout (Rouge)', color: 'bg-red-500' },
  { value: 2, label: '2 - Faible / Peu (Orange)', color: 'bg-orange-400' },
  { value: 3, label: '3 - Moyen / Neutre (Jaune)', color: 'bg-yellow-300' },
  { value: 4, label: '4 - Bon / Assez (Vert clair)', color: 'bg-lime-400' },
  { value: 5, label: '5 - Très bon / Totalement (Vert foncé)', color: 'bg-green-500' },
];

const AssessmentQuestionnaire = () => {
  const navigate = useNavigate();
  const { userId } = useAuth(); // Récupérer userId depuis le contexte d'authentification
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  // --- useEffect pour charger les réponses sauvegardées au montage ---
  // Ce useEffect s'exécute quand le composant monte ou quand userId change.
  // C'est ici que nous lisons le localStorage.
  useEffect(() => {
    console.log("AQ: useEffect de chargement déclenché. userId:", userId);

    if (userId) { // On ne tente de charger que si l'userId est défini
      const localStorageKeyAnswers = `assessment_answers_${userId}`; // Crée les clés ici
      const localStorageKeyProgress = `assessment_progress_${userId}`; // Crée les clés ici

      const savedAnswers = localStorage.getItem(localStorageKeyAnswers);
      if (savedAnswers) {
        try {
          setAnswers(JSON.parse(savedAnswers));
          console.log("AQ: Réponses chargées depuis localStorage:", JSON.parse(savedAnswers));
        } catch (e) {
          console.error("AQ: Erreur lors du parsing des réponses sauvegardées:", e);
          localStorage.removeItem(localStorageKeyAnswers); // Supprime les données corrompues si elles sont invalides
        }
      } else {
        console.log("AQ: Aucune réponse sauvegardée trouvée pour cet utilisateur. Initialisation des réponses à vide.");
        setAnswers({}); // S'assurer que l'état est vide si rien n'est trouvé
      }

      const savedProgress = localStorage.getItem(localStorageKeyProgress);
      if (savedProgress) {
        try {
          setProgress(parseInt(savedProgress, 10));
          console.log("AQ: Progression chargée depuis localStorage:", parseInt(savedProgress, 10));
        } catch (e) {
          console.error("AQ: Erreur lors du parsing de la progression sauvegardée:", e);
          localStorage.removeItem(localStorageKeyProgress); // Supprime les données corrompues si elles sont invalides
        }
      } else {
        console.log("AQ: Aucune progression sauvegardée trouvée pour cet utilisateur. Initialisation de la progression à 0.");
        setProgress(0); // S'assurer que l'état est à 0 si rien n'est trouvé
      }
    } else {
      // Si userId n'est pas encore disponible (ex: premier rendu avant que AuthContext ne se charge)
      // ou si l'utilisateur est déconnecté, on s'assure que le questionnaire est vide.
      console.log("AQ: userId n'est pas encore disponible (ou déconnecté). Initialisation du questionnaire à vide.");
      setAnswers({});
      setProgress(0);
    }
  }, [userId]); // Dépendance à userId : ce hook se re-déclenche quand userId change (ex: après connexion)

  // --- useEffect pour sauvegarder les réponses et calculer la progression à chaque changement ---
  // Ce useEffect s'exécute quand les 'answers' changent, pour sauvegarder en temps réel.
  useEffect(() => {
    // On ne sauvegarde que si l'userId est défini et que les réponses sont bien un objet (pas l'état initial vide avant chargement)
    if (userId && Object.keys(answers).length > 0) { // On ajoute Object.keys(answers).length > 0 pour éviter la sauvegarde d'un état vide initial
      const localStorageKeyAnswers = `assessment_answers_${userId}`;
      const localStorageKeyProgress = `assessment_progress_${userId}`;

      console.log("AQ: useEffect de sauvegarde déclenché. Sauvegarde en cours...");
      localStorage.setItem(localStorageKeyAnswers, JSON.stringify(answers));

      // Calcul de la progression
      let totalQuestions = 0;
      let answeredQuestions = 0;

      themes.forEach(theme => { // `themes` est utilisé ici, mais il est externe et stable
        theme.questions.forEach(q => {
          totalQuestions++;
          if (answers[theme.id]?.[q.id]?.evaluation) {
            answeredQuestions++;
          }
        });
      });

      const currentProgress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
      const roundedProgress = Math.round(currentProgress);

      // Met à jour le state `progress` et sauvegarde si la valeur arrondie a changé,
      // pour éviter des boucles de rendu inutiles.
      if (roundedProgress !== progress) {
          setProgress(roundedProgress);
      }
      localStorage.setItem(localStorageKeyProgress, roundedProgress.toString());
      console.log("AQ: Réponses et progression sauvegardées.");
    } else if (userId && Object.keys(answers).length === 0 && progress === 0) {
        // C'est le cas où les réponses sont vidées (ex: après soumission ou déconnexion)
        // ou l'initialisation quand userId est présent mais il n'y a pas de data sauvegardée
        console.log("AQ: userId est présent mais les réponses sont vides, pas de sauvegarde inutile.");
    }
  }, [answers, userId, progress]); // `themes` a été supprimé des dépendances ici

  const handleChange = (themeId, questionId, field, value) => {
    setAnswers(prev => ({
      ...prev,
      [themeId]: {
        ...(prev[themeId] || {}),
        [questionId]: {
          ...(prev[themeId]?.[questionId] || {}),
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // --- Validation ---
    let allEvaluationsDone = true;
    themes.forEach(theme => {
      theme.questions.forEach(q => {
        if (!answers[theme.id]?.[q.id]?.evaluation) {
          allEvaluationsDone = false;
        }
      });
    });

    if (!allEvaluationsDone) {
        setError("Veuillez évaluer toutes les questions avant de soumettre.");
        setIsLoading(false);
        return;
    }

    try {
      if (!userId) {
          setError("Vous devez être connecté pour soumettre un bilan.");
          setIsLoading(false);
          return;
      }

      const response = await bilanService.createBilan({
        clientId: userId,
        responses: answers,
        submissionDate: new Date().toISOString(),
        status: 'submitted'
      });

      console.log('AQ: Bilan soumis avec succès:', response.data);
      alert('Votre bilan a été soumis !');
      // Supprime les réponses et la progression du localStorage après soumission réussie
      const localStorageKeyAnswers = `assessment_answers_${userId}`;
      const localStorageKeyProgress = `assessment_progress_${userId}`;
      localStorage.removeItem(localStorageKeyAnswers);
      localStorage.removeItem(localStorageKeyProgress);
      console.log("AQ: Réponses et progression effacées du localStorage après soumission.");
      navigate('/dashboard-client');

    } catch (err) {
      console.error('AQ: Erreur lors de la soumission du bilan:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || 'Erreur lors de la soumission du bilan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Questionnaire d'Auto-évaluation</h1>
      <p className="text-gray-700 text-center mb-8">
        Évaluez votre niveau pour chaque compétence sur une échelle de 1 (Très faible / Pas du tout) à 5 (Très bon / Totalement).
        N'hésitez pas à ajouter des commentaires pour préciser votre pensée.
      </p>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Barre de progression */}
      <div className="mb-8 p-4 bg-blue-100 rounded-lg shadow-inner">
        <h3 className="text-blue-800 text-lg font-semibold mb-2 text-center">Progression du Bilan : {progress}%</h3>
        <div className="w-full bg-gray-300 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {progress < 100 && (
          <p className="text-sm text-blue-700 text-center mt-2">Continuez, vos réponses sont sauvegardées automatiquement !</p>
        )}
        {progress === 100 && (
          <p className="text-sm text-green-700 text-center mt-2">Bilan complet ! Vous pouvez maintenant le soumettre.</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {themes.map(theme => (
          <div key={theme.id} className="mb-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold mb-6 text-blue-700">{theme.title}</h2>
            {theme.questions.map(q => (
              <div key={q.id} className="mb-8 p-4 border border-gray-100 rounded-lg bg-gray-50">
                <p className="text-lg font-medium mb-3">{q.text}</p>

                {/* Section d'évaluation (Rouge au Vert) */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
                  {scaleOptions.map(option => (
                    <label key={option.value} className="flex flex-col items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`${theme.id}-${q.id}-evaluation`}
                        value={option.value}
                        checked={answers[theme.id]?.[q.id]?.evaluation === option.value}
                        onChange={() => handleChange(theme.id, q.id, 'evaluation', option.value)}
                        className="hidden"
                        required
                      />
                      <span className={`block w-8 h-8 rounded-full ${option.color} flex items-center justify-center text-white font-bold text-sm border-2 ${answers[theme.id]?.[q.id]?.evaluation === option.value ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'} transition-all duration-200 ease-in-out`}>
                        {option.value}
                      </span>
                      <span className="mt-1 text-xs text-gray-600 text-center">{option.label.split(' - ')[1]}</span>
                    </label>
                  ))}
                </div>

                {/* Champ de commentaire */}
                <div>
                  <label htmlFor={`${theme.id}-${q.id}-comment`} className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaire (facultatif) :
                  </label>
                  <textarea
                    id={`${theme.id}-${q.id}-comment`}
                    name={`${theme.id}-${q.id}-comment`}
                    value={answers[theme.id]?.[q.id]?.comment || ''}
                    onChange={(e) => handleChange(theme.id, q.id, 'comment', e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Précisez votre ressenti, donnez des exemples..."
                  ></textarea>
                </div>
              </div>
            ))}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
          disabled={isLoading || progress < 100}
        >
          {isLoading ? 'Soumission...' : 'Soumettre mon bilan'}
        </button>
      </form>
    </div>
  );
};

export default AssessmentQuestionnaire;