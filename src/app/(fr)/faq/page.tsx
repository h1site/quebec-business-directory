import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'FAQ - Questions fréquentes',
  description: 'Trouvez les réponses aux questions les plus fréquentes sur le Registre d\'entreprises du Québec.',
}

const faqs = [
  {
    question: 'Qu\'est-ce que le Registre d\'entreprises du Québec?',
    answer: 'Le Registre d\'entreprises du Québec est un annuaire en ligne gratuit qui répertorie plus de 46 000 entreprises québécoises. Notre mission est de faciliter la recherche d\'entreprises locales en offrant des informations complètes et à jour.'
  },
  {
    question: 'Comment ajouter mon entreprise au registre?',
    answer: 'Pour ajouter votre entreprise, créez un compte gratuit et cliquez sur "Ajouter une entreprise". Remplissez le formulaire avec les informations de votre entreprise (nom, adresse, coordonnées, description, etc.) et soumettez votre demande. Votre fiche sera publiée après vérification.'
  },
  {
    question: 'Comment réclamer ma fiche d\'entreprise existante?',
    answer: 'Si votre entreprise est déjà répertoriée, connectez-vous à votre compte et recherchez votre entreprise. Cliquez sur "Réclamer cette fiche" et suivez le processus de vérification. Une fois vérifié, vous pourrez modifier les informations de votre entreprise.'
  },
  {
    question: 'Est-ce gratuit d\'inscrire mon entreprise?',
    answer: 'Oui, l\'inscription de base est entièrement gratuite. Vous pouvez ajouter votre entreprise, gérer vos informations et répondre aux avis sans frais.'
  },
  {
    question: 'D\'où proviennent les données des entreprises?',
    answer: 'Les données proviennent de plusieurs sources, notamment le Registraire des entreprises du Québec (données publiques gouvernementales), Google Places API, et les informations soumises directement par les propriétaires d\'entreprises.'
  },
  {
    question: 'Comment modifier les informations de mon entreprise?',
    answer: 'Connectez-vous à votre compte, accédez à votre tableau de bord et sélectionnez l\'entreprise que vous souhaitez modifier. Vous pouvez mettre à jour toutes les informations: coordonnées, description, heures d\'ouverture, photos, etc.'
  },
  {
    question: 'Comment supprimer ma fiche d\'entreprise?',
    answer: 'Pour supprimer votre fiche, contactez-nous à info@h1site.com avec les détails de votre entreprise. Nous traiterons votre demande dans les plus brefs délais.'
  },
  {
    question: 'Comment signaler des informations incorrectes?',
    answer: 'Si vous remarquez des informations incorrectes sur une fiche, vous pouvez nous contacter à info@h1site.com en précisant les corrections à apporter. Nous vérifierons et mettrons à jour les informations.'
  },
  {
    question: 'Qu\'est-ce que le NEQ?',
    answer: 'Le NEQ (Numéro d\'Entreprise du Québec) est un identifiant unique attribué à chaque entreprise enregistrée au Québec. Il est composé de 10 chiffres et permet d\'identifier officiellement une entreprise auprès du gouvernement.'
  },
  {
    question: 'Comment contacter le support?',
    answer: 'Pour toute question ou assistance, envoyez-nous un courriel à info@h1site.com. Nous répondons généralement dans un délai de 24 à 48 heures ouvrables.'
  }
]

export default function FAQPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h1>
            <p className="text-xl text-gray-600">
              Trouvez les réponses à vos questions sur le Registre d&apos;entreprises du Québec
            </p>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 group"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h2 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h2>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vous n&apos;avez pas trouvé votre réponse?
            </h2>
            <p className="text-gray-600 mb-6">
              Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs délais.
            </p>
            <a
              href="mailto:info@h1site.com"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
