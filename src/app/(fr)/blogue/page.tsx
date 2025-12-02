import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Blogue',
  description: 'Découvrez nos articles et conseils pour les entreprises québécoises.',
}

export default function BlogPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blogue</h1>
            <p className="text-xl text-gray-600">
              Conseils et actualités pour les entreprises québécoises
            </p>
          </div>

          {/* Coming Soon */}
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contenu à venir
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Notre blogue est en cours de préparation. Bientôt, vous trouverez ici des articles,
              des conseils et des ressources pour vous aider à développer votre entreprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/recherche"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Rechercher une entreprise
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-8 bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Restez informé
            </h3>
            <p className="text-gray-600 mb-4">
              Rejoignez notre communauté Facebook pour être notifié des nouveaux articles.
            </p>
            <a
              href="https://www.facebook.com/groups/registreduquebec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1877f2] text-white font-semibold rounded-lg hover:bg-[#166fe5] transition-colors"
            >
              <span className="w-5 h-5 bg-white text-[#1877f2] rounded-full flex items-center justify-center text-xs font-bold">f</span>
              Rejoindre le groupe
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
