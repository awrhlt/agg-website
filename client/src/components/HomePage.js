import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  FileText, 
  MessageCircle, 
  CheckCircle, 
  ArrowRight,
  Star
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Votre Bilan de Compétences
              <span className="block text-blue-200">Simplifié et Personnalisé</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Découvrez vos talents, explorez vos possibilités et construisez votre avenir professionnel avec notre plateforme de suivi personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center"
              >
                Commencer mon bilan
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir BilanPro ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une approche moderne et interactive pour votre développement professionnel
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Suivi en temps réel</h3>
              <p className="text-gray-600">
                Visualisez vos progrès et l'avancement de votre bilan à chaque étape
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Documents centralisés</h3>
              <p className="text-gray-600">
                Stockez et accédez à tous vos documents en un seul endroit sécurisé
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Communication directe</h3>
              <p className="text-gray-600">
                Échangez facilement avec votre consultant via notre messagerie intégrée
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accompagnement personnalisé</h3>
              <p className="text-gray-600">
                Bénéficiez d'un suivi individualisé adapté à vos objectifs professionnels
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Un processus simple et structuré en 4 étapes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Inscription",
                description: "Créez votre compte et complétez votre profil",
                color: "blue"
              },
              {
                step: "2",
                title: "Auto-évaluation",
                description: "Répondez aux questionnaires personnalisés",
                color: "green"
              },
              {
                step: "3",
                title: "Accompagnement",
                description: "Échangez avec votre consultant expert",
                color: "purple"
              },
              {
                step: "4",
                title: "Synthèse",
                description: "Recevez votre bilan complet et vos recommandations",
                color: "orange"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`bg-${item.color}-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className={`text-${item.color}-600 text-2xl font-bold`}>
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à découvrir votre potentiel ?
          </h2>
          <p className="text-xl mb-8">
            Rejoignez des centaines de professionnels qui ont transformé leur carrière
          </p>
          <Link 
            to="/register" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 inline-flex items-center"
          >
            Commencer maintenant
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 BilanPro. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;