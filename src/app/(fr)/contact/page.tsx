import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez le Registre des entreprises du Québec. Questions, suggestions, demandes de modification de fiche.',
}

export default function ContactPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
            <p className="text-xl text-gray-600">
              Nous sommes là pour vous aider
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos coordonnées</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Courriel</h3>
                    <a href="mailto:info@h1site.com" className="text-blue-600 hover:underline">
                      info@h1site.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600">
                      Vaudreuil-Dorion<br />
                      Québec, Canada
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Réseaux sociaux</h3>
                    <a
                      href="https://www.facebook.com/groups/registreduquebec"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Groupe Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Comment modifier ma fiche?</h3>
                  <p className="text-gray-600 text-sm">
                    Connectez-vous à votre compte et accédez à votre tableau de bord pour modifier les informations de votre entreprise.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Comment ajouter mon entreprise?</h3>
                  <p className="text-gray-600 text-sm">
                    Cliquez sur &quot;Ajouter une entreprise&quot; dans le menu et remplissez le formulaire.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Comment signaler une erreur?</h3>
                  <p className="text-gray-600 text-sm">
                    Envoyez-nous un courriel avec le nom de l&apos;entreprise et la correction à apporter.
                  </p>
                </div>

                <Link
                  href="/faq"
                  className="block text-center text-blue-600 hover:underline font-medium mt-4"
                >
                  Voir toutes les FAQ
                </Link>
              </div>
            </div>
          </div>

          {/* Response Time */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 text-center">
            <p className="text-blue-800">
              <strong>Délai de réponse:</strong> Nous répondons généralement dans un délai de 24 à 48 heures ouvrables.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/entreprise/nouvelle"
              className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter votre entreprise gratuitement
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
