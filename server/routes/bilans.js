const express = require('express');
const router = express.Router();
const { User, Bilan } = require('../models');
const { protect, authorize } = require('../middleware/authMiddleware');

// Fonctions utilitaires pour la synthèse (la même fonction que précédemment)
const generateSynthesisText = (averageScores, comments) => {
    let analysis = "";
    let recommendations = "### Recommandations :\n\n";
    let hasRecommendations = false;

    // Analyse et Recommandations par Thème
    const themesAnalysis = {
        competences_techniques: {
            title: 'Compétences Techniques (savoirs, savoir-faire)',
            ranges: {
                high: "Vos compétences techniques sont un atout majeur. Vous maîtrisez bien les outils et concepts de votre domaine. Continuez à vous perfectionner, peut-être en explorant des technologies émergentes ou des domaines de niche.",
                medium: "Vous avez une base solide en compétences techniques. Il y a des opportunités d'approfondir certains domaines ou d'acquérir de nouvelles expertises pour diversifier votre profil.",
                low: "Vos compétences techniques pourraient être un axe d'amélioration prioritaire. Un développement ciblé dans des domaines clés est recommandé pour renforcer votre profil."
            },
            recommendations: {
                low: "- Formation ciblée sur [technologie/domaine spécifique] ; - Projets pratiques pour consolider les acquis ; - Veille technologique active.",
                high_medium: "- Certification avancée dans votre domaine ; - Mentoring de junior ; - Participation à des conférences/meetups."
            }
        },
        competences_transversales: {
            title: 'Compétences Transversales (soft skills)',
            ranges: {
                high: "Votre communication, gestion du stress et travail d'équipe sont des points forts remarquables. Ces compétences sont très appréciées et faciliteront votre intégration dans divers environnements.",
                medium: "Vos compétences transversales sont fonctionnelles. Un effort conscient sur la communication orale ou la gestion des priorités pourrait optimiser vos performances.",
                low: "C'est un domaine nécessitant une attention particulière. Développer vos compétences en communication, écoute active ou gestion de conflit est crucial pour votre évolution professionnelle."
            },
            recommendations: {
                low: "- Ateliers de communication ou de leadership ; - Demander des retours constructifs réguliers ; - S'engager dans des rôles nécessitant plus d'interaction.",
                high_medium: "- Rôles de mentorat ou de leadership d'équipe ; - Prise de parole en public ; - Négociation et résolution de conflits."
            }
        },
        qualites_personnelles: {
            title: 'Qualités Personnelles',
            ranges: {
                high: "Votre autonomie, créativité et rigueur sont très développées. Ces qualités vous permettront d'exceller dans des environnements exigeants et de prendre des initiatives.",
                medium: "Vous possédez des qualités personnelles solides. En les identifiant et les mettant en avant, vous pourrez mieux vous positionner sur le marché du travail.",
                low: "Identifier et développer certaines qualités personnelles (ex: adaptabilité, initiative) pourrait grandement améliorer votre épanouissement et votre efficacité professionnelle."
            },
            recommendations: {
                low: "- Exercices d'introspection pour identifier les valeurs ; - Participer à des activités de groupe pour développer l'adaptabilité ; - Définir des objectifs personnels clairs.",
                high_medium: "- Se lancer dans des projets entrepreneuriaux ; - Assumer des responsabilités accrues ; - Mettre en avant ces qualités dans votre Personal Branding."
            }
        },
        motivations_valeurs: {
            title: 'Motivations et Valeurs Professionnelles',
            ranges: {
                high: "Vos motivations et valeurs sont très claires et alignées avec vos aspirations. Cela vous donnera une direction forte dans vos choix de carrière et contribuera à votre satisfaction.",
                medium: "Vos motivations sont présentes mais pourraient être plus affinées. Une meilleure compréhension de vos valeurs fondamentales éclairera vos prochaines étapes professionnelles.",
                low: "Il est essentiel de clarifier vos motivations et valeurs. Ce travail d'introspection vous aidera à trouver un environnement de travail où vous pourrez vous épanouir pleinement."
            },
            recommendations: {
                low: "- Coaching ou bilan de compétences approfondi ; - Lecture sur la psychologie du travail ; - Dialoguer avec des professionnels de divers secteurs.",
                high_medium: "- Chercher des rôles alignés avec vos valeurs profondes ; - Participer à des initiatives qui reflètent vos motivations."
            }
        },
        interets_professionnels: {
            title: 'Intérêts Professionnels',
            ranges: {
                high: "Vous avez des intérêts professionnels bien définis, ce qui est un atout pour cibler les opportunités et les secteurs qui vous correspondent le mieux.",
                medium: "Vos intérêts sont assez clairs, mais l'exploration de nouveaux secteurs ou types de missions pourrait élargir vos horizons et révéler de nouvelles passions.",
                low: "Un travail d'exploration est nécessaire pour identifier les secteurs et types de missions qui correspondent le mieux à vos aspirations et compétences."
            },
            recommendations: {
                low: "- Enquêtes métiers ; - Stages d'observation ; - Participation à des salons professionnels ; - Networking ciblé.",
                high_medium: "- Veille sur les innovations de votre secteur ; - Mentoring inversé ; - Participation à des projets open source ou pro-bono."
            }
        }
    };

    analysis += "### Analyse Détaillée :\n\n";

    for (const themeId in themesAnalysis) {
        if (averageScores[themeId] !== undefined) {
            const score = averageScores[themeId];
            const themeInfo = themesAnalysis[themeId];
            let rangeText = "";
            let currentRecommendations = "";

            analysis += `**${themeInfo.title} :** `;

            if (score >= 4) {
                rangeText = themeInfo.ranges.high;
                currentRecommendations = themeInfo.recommendations.high_medium;
            } else if (score >= 3) {
                rangeText = themeInfo.ranges.medium;
                currentRecommendations = themeInfo.recommendations.high_medium;
            } else { // score < 3 (low)
                rangeText = themeInfo.ranges.low;
                currentRecommendations = themeInfo.recommendations.low;
                hasRecommendations = true; // S'il y a des points faibles, il y a des recommandations spécifiques
            }
            analysis += `${rangeText}\n`;
            recommendations += `- Pour ${themeInfo.title} : ${currentRecommendations}\n`;
        }
    }

    // Ajout des commentaires
    analysis += "\n### Commentaires du Client :\n\n";
    let allCommentsAreEmpty = true;
    for (const themeId in comments) {
        for (const questionId in comments[themeId]) {
            if (comments[themeId][questionId] && comments[themeId][questionId].trim() !== '') {
                analysis += `- ${comments[themeId][questionId]}\n`;
                allCommentsAreEmpty = false;
            }
        }
    }
    if (allCommentsAreEmpty) {
        analysis += "Aucun commentaire spécifique n'a été fourni pour ce bilan. L'ajout de précisions pourrait affiner l'analyse future.\n";
    }

    // Synthèse générale initiale (peut être affinée)
    const overallAverage = Object.values(averageScores).reduce((acc, score) => acc + score, 0) / Object.keys(averageScores).length;
    analysis += `\n### Vue d'ensemble :\nVotre auto-évaluation globale indique un niveau moyen de ${overallAverage.toFixed(1)}/5 sur l'ensemble des thèmes abordés.`;
    if (overallAverage >= 4) analysis += " Cela dénote une forte conscience de vos atouts.";
    else if (overallAverage <= 2) analysis += " C'est une excellente occasion d'identifier et de développer de nouveaux axes.";
    else analysis += " Cela suggère un profil équilibré avec des potentiels d'amélioration ciblés.";


    // Si aucune recommandation spécifique n'a été ajoutée basée sur des scores faibles, on peut en ajouter une générale.
    if (!hasRecommendations) {
        recommendations += "- Continuez à capitaliser sur vos forces ; - Restez en veille sur les évolutions de votre secteur pour anticiper les besoins futurs ; - Pensez à des formations de perfectionnement pour maintenir votre niveau d'expertise.\n";
    }

    return analysis + "\n" + recommendations;
};


// NOUVELLE ROUTE : POST /api/bilans/save-draft - Pour sauvegarder/mettre à jour un brouillon de bilan
router.post('/save-draft', protect, authorize(['client']), async (req, res) => {
    try {
        const clientId = req.user.id;
        const { responses, completionPercentage } = req.body; // Inclure le pourcentage de complétion

        if (!responses) {
            return res.status(400).json({ message: 'Les réponses du brouillon sont requises.' });
        }

        let bilanDraft = await Bilan.findOne({
            where: {
                client_id: clientId,
                status: 'draft'
            }
        });

        if (bilanDraft) {
            // Mettre à jour le brouillon existant
            bilanDraft.responses = responses;
            // Vous pouvez stocker le pourcentage dans un champ séparé si vous voulez le persister dans la DB
            // Par exemple, ajouter un champ 'completionPercentage' au modèle Bilan
            // Pour l'instant, on se base sur les réponses pour le calculer dynamiquement.
            await bilanDraft.save();
            return res.status(200).json({ message: 'Brouillon de bilan mis à jour avec succès.', bilanId: bilanDraft.id });
        } else {
            // Créer un nouveau brouillon
            const newBilanDraft = await Bilan.create({
                client_id: clientId,
                responses: responses,
                status: 'draft'
            });
            return res.status(201).json({ message: 'Nouveau brouillon de bilan créé avec succès.', bilanId: newBilanDraft.id });
        }

    } catch (error) {
        console.error('Erreur lors de la sauvegarde du brouillon de bilan:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la sauvegarde du brouillon.' });
    }
});


// ROUTE 1: POST /api/bilans - Pour soumettre un nouveau bilan (par un client)
router.post('/', protect, authorize(['client']), async (req, res) => {
  try {
    const clientId = req.user.id;
    const { responses, status } = req.body; // 'status' ici devrait être 'submitted'

    if (!responses) {
      return res.status(400).json({ message: 'Les réponses du questionnaire sont requises.' });
    }

    // Chercher un brouillon existant pour ce client
    let bilanToSubmit = await Bilan.findOne({
        where: {
            client_id: clientId,
            status: 'draft'
        }
    });

    if (bilanToSubmit) {
        // Mettre à jour le brouillon existant et le marquer comme soumis
        bilanToSubmit.responses = responses;
        bilanToSubmit.status = 'submitted';
        await bilanToSubmit.save();
        res.status(200).json({
            message: 'Bilan soumis avec succès (brouillon mis à jour).',
            bilan: bilanToSubmit
        });
    } else {
        // Créer un nouveau bilan directement soumis
        const newBilan = await Bilan.create({
            client_id: clientId,
            responses: responses,
            status: status || 'submitted', // Assurez-vous que le frontend envoie 'submitted'
        });
        res.status(201).json({
            message: 'Bilan créé et soumis avec succès.',
            bilan: newBilan
        });
    }

  } catch (error) {
    console.error('Erreur lors de la création/soumission du bilan:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la création/soumission du bilan' });
  }
});

// ROUTE 2: GET /api/bilans/client/:id - Pour qu'un client (ou consultant) voie les bilans d'un client spécifique
router.get('/client/:id', protect, authorize(['client', 'consultant']), async (req, res) => {
  try {
    const clientIdFromParams = req.params.id;

    if (req.user.userType === 'client' && req.user.id !== parseInt(clientIdFromParams)) {
      return res.status(403).json({ message: 'Accès interdit. Vous ne pouvez voir que vos propres bilans.' });
    }

    // Récupérer les bilans soumis OU les brouillons pour ce client
    const bilans = await Bilan.findAll({
      where: {
        client_id: clientIdFromParams,
        statut: ['submitted', 'in_review', 'completed', 'suspended', 'draft'] // Inclure les brouillons ici
      },
      order: [['created_at', 'ASC']],
      include: [
        { model: User, as: 'Client', attributes: ['id', 'nom', 'prenom', 'email', 'role'] }
      ]
    });

    // Optionnel: filtrer les brouillons pour ne renvoyer que le plus récent si besoin
    // ou renvoyer tous les bilans pour que le frontend gère l'affichage

    // S'il n'y a aucun bilan (même pas un brouillon), renvoyer 404
    if (!bilans || bilans.length === 0) {
      return res.status(404).json({ message: 'Aucun bilan (soumis ou brouillon) trouvé pour ce client.' });
    }
    res.json(bilans);
  } catch (error) {
    console.error('Erreur GET /bilans/client/:id:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des bilans client.' });
  }
});

// ROUTE EXISTANTE : GET /api/bilans/client/:clientId/synthesis - Pour obtenir la synthèse d'un client
router.get('/client/:clientId/synthesis', protect, authorize(['consultant']), async (req, res) => {
    try {
        const { clientId } = req.params;
        const consultantId = req.user.id;

        const bilans = await Bilan.findAll({
            where: {
                client_id: clientId,
                statut: ['submitted', 'in_review', 'completed', 'suspended'] // Synthèse seulement des bilans non-brouillons
            },
            order: [['created_at', 'ASC']],
            include: [
                { model: User, as: 'Client', attributes: ['id', 'nom', 'prenom', 'email', 'role'] }
            ]
        });

        if (!bilans || bilans.length === 0) {
            return res.status(404).json({ message: 'Aucun bilan soumis trouvé pour ce client.' });
        }

        const synthesisData = {
            clientInfo: {
                id: bilans[0].Client.id,
                nom: bilans[0].Client.nom,
                prenom: bilans[0].Client.prenom,
                email: bilans[0].Client.email,
            },
            bilanSummaries: [],
            overallSynthesis: "",
            evolutionData: {}
        };

        const themesOrder = [
            'competences_techniques',
            'competences_transversales',
            'qualites_personnelles',
            'motivations_valeurs',
            'interets_professionnels'
        ];

        let lastBilanResponses = null;
        let lastBilanComments = {};

        bilans.forEach(bilan => {
            const currentResponses = bilan.responses;
            const currentBilanSummary = {
                bilanId: bilan.id,
                submissionDate: bilan.created_at,
                scores: {},
                comments: {}
            };

            let totalOverallScore = 0;
            let totalOverallQuestions = 0;

            themesOrder.forEach(themeId => {
                let themeTotalScore = 0;
                let themeQuestionCount = 0;
                currentBilanSummary.comments[themeId] = {};

                if (currentResponses && typeof currentResponses === 'object' && currentResponses[themeId]) {
                    for (const questionId in currentResponses[themeId]) {
                        const response = currentResponses[themeId][questionId];
                        if (response && response.evaluation) {
                            themeTotalScore += response.evaluation;
                            totalOverallScore += response.evaluation;
                            themeQuestionCount++;
                            totalOverallQuestions++;
                        }
                        if (response && response.comment) {
                            currentBilanSummary.comments[themeId][questionId] = response.comment;
                        }
                    }
                }
                currentBilanSummary.scores[themeId] = themeQuestionCount > 0 ? (themeTotalScore / themeQuestionCount) : 0;

                if (!synthesisData.evolutionData[themeId]) {
                    synthesisData.evolutionData[themeId] = [];
                }
                synthesisData.evolutionData[themeId].push({
                    date: bilan.created_at,
                    score: currentBilanSummary.scores[themeId]
                });
            });

            currentBilanSummary.overallAverageScore = totalOverallQuestions > 0 ? (totalOverallScore / totalOverallQuestions) : 0;
            synthesisData.bilanSummaries.push(currentBilanSummary);

            lastBilanResponses = currentResponses;
            lastBilanComments = currentBilanSummary.comments;
        });

        if (lastBilanResponses) {
            const averageScoresForSynthesis = {};
            themesOrder.forEach(themeId => {
                averageScoresForSynthesis[themeId] = synthesisData.bilanSummaries[synthesisData.bilanSummaries.length - 1].scores[themeId];
            });
            synthesisData.overallSynthesis = generateSynthesisText(averageScoresForSynthesis, lastBilanComments);
        }

        res.json(synthesisData);

    } catch (error) {
        console.error('Erreur lors de la récupération de la synthèse du bilan:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la génération de la synthèse.' });
    }
});


// NOUVELLE ROUTE : POST /api/bilans/client/:clientId/send-synthesis - Pour envoyer la synthèse au client
router.post('/client/:clientId/send-synthesis', protect, authorize(['consultant']), async (req, res) => {
    try {
        const { clientId } = req.params;
        const consultantId = req.user.id;

        const client = await User.findByPk(clientId, { attributes: ['id', 'email', 'nom', 'prenom'] });
        if (!client) {
            return res.status(404).json({ message: 'Client introuvable.' });
        }

        const bilans = await Bilan.findAll({
            where: {
                client_id: clientId,
                statut: ['submitted', 'in_review', 'completed', 'suspended'] // Prenez seulement les bilans soumis
            },
            order: [['created_at', 'DESC']],
            limit: 1
        });

        if (!bilans || bilans.length === 0) {
            return res.status(404).json({ message: 'Aucun bilan soumis trouvé pour ce client pour générer la synthèse.' });
        }

        const latestBilan = bilans[0];
        const latestResponses = latestBilan.responses;
        const latestComments = {};
        const averageScoresForSynthesis = {};

        if (latestResponses) {
             const themesOrder = [
                'competences_techniques',
                'competences_transversales',
                'qualites_personnelles',
                'motivations_valeurs',
                'interets_professionnels'
            ];
            themesOrder.forEach(themeId => {
                let themeTotalScore = 0;
                let themeQuestionCount = 0;
                latestComments[themeId] = {};
                if (latestResponses[themeId]) {
                    for (const questionId in latestResponses[themeId]) {
                        const response = latestResponses[themeId][questionId];
                        if (response && response.evaluation) {
                            themeTotalScore += response.evaluation;
                            themeQuestionCount++;
                        }
                        if (response && response.comment) {
                            latestComments[themeId][questionId] = response.comment;
                        }
                    }
                }
                averageScoresForSynthesis[themeId] = themeQuestionCount > 0 ? (themeTotalScore / themeQuestionCount) : 0;
            });
        }

        const synthesisContent = generateSynthesisText(averageScoresForSynthesis, latestComments);

        console.log(`--- Début Envoi Synthèse ---`);
        console.log(`Synthèse pour le client ${client.prenom} ${client.nom} (ID: ${clientId}, Email: ${client.email})`);
        console.log(`Envoyée par le consultant ID: ${consultantId}`);
        console.log(`Contenu de la synthèse :\n${synthesisContent}`);
        console.log(`--- Fin Envoi Synthèse ---`);

        res.status(200).json({ message: `Synthèse envoyée avec succès au client ${client.email} !` });

    } catch (error) {
        console.error('Erreur lors de l\'envoi de la synthèse:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'envoi de la synthèse.' });
    }
});


// ROUTE 3: GET /api/bilans - POUR LES CONSULTANTS (Récupérer TOUS les bilans soumis)
router.get('/', protect, authorize(['consultant']), async (req, res) => {
  try {
    const bilans = await Bilan.findAll({
      include: [
        { model: User, as: 'Client', attributes: ['id', 'nom', 'prenom', 'email', 'role'] },
        { model: User, as: 'Consultant', attributes: ['id', 'nom', 'prenom', 'email', 'role'], required: false }
      ]
    });
    res.json(bilans);
  } catch (error) {
    console.error('Erreur GET /bilans (tous les bilans):', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de tous les bilans.' });
  }
});

module.exports = router;