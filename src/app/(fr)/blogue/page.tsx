import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Blogue | Registre du Québec',
  description: 'Découvrez nos vidéos et conseils pour les entreprises québécoises. Tutoriels, guides et ressources.',
}

const videos = [
  {
    id: 'video-1',
    title: 'Comment créer une fiche d\'entreprise sur Registre du Québec',
    description: 'Apprenez étape par étape comment inscrire votre entreprise sur notre plateforme et maximiser votre visibilité.',
    youtubeId: 'dQw4w9WgXcQ', // À remplacer par le vrai ID
    date: '2024-11-15',
  },
  {
    id: 'video-2',
    title: 'Optimiser votre présence en ligne au Québec',
    description: 'Conseils et astuces pour améliorer le référencement de votre entreprise québécoise.',
    youtubeId: 'dQw4w9WgXcQ', // À remplacer par le vrai ID
    date: '2024-11-10',
  },
  {
    id: 'video-3',
    title: 'Les avantages d\'être inscrit au Registre du Québec',
    description: 'Découvrez pourquoi des milliers d\'entreprises font confiance à notre annuaire.',
    youtubeId: 'dQw4w9WgXcQ', // À remplacer par le vrai ID
    date: '2024-11-05',
  },
]

export default function BlogPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blogue</h1>
            <p className="text-xl text-gray-600">
              Vidéos et conseils pour les entreprises québécoises
            </p>
          </div>

          {/* Videos Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {videos.map((video) => (
              <article key={video.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* YouTube Embed */}
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <time className="text-sm text-gray-500 mb-2 block">
                    {new Date(video.date).toLocaleDateString('fr-CA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {video.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* YouTube Channel CTA */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-center text-white">
            <div className="text-5xl mb-4">▶️</div>
            <h3 className="text-2xl font-bold mb-2">
              Abonnez-vous à notre chaîne YouTube
            </h3>
            <p className="text-red-100 mb-6 max-w-md mx-auto">
              Ne manquez aucune de nos nouvelles vidéos et tutoriels pour développer votre entreprise.
            </p>
            <a
              href="https://www.youtube.com/@H1SiteOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              S&apos;abonner à la chaîne
            </a>
          </div>

          {/* Facebook Group */}
          <div className="mt-8 bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Rejoignez notre communauté
            </h3>
            <p className="text-gray-600 mb-4">
              Échangez avec d&apos;autres entrepreneurs québécois sur notre groupe Facebook.
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
