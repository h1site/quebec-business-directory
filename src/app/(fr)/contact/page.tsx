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

      <main className="min-h-screen pt-16" style={{ background: 'var(--background)' }}>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden" style={{ background: 'var(--background)' }}>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl text-white mb-4 uppercase" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 900 }}>
              Contactez-nous
            </h1>
            <p className="text-xl text-slate-400">
              Nous sommes là pour vous aider
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-[100px] relative bg-white">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'url(/images/background/background-overlay-dark.png)',
              backgroundAttachment: 'fixed',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              opacity: 0.02,
            }}
          />
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="rounded-2xl p-8 bg-gray-50 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos coordonnées</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-2xl">✉️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Courriel</h3>
                      <a href="mailto:info@h1site.com" className="text-sky-500 hover:text-sky-400">
                        info@h1site.com
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0">
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
                    <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Réseaux sociaux</h3>
                      <div className="flex flex-col gap-1">
                        <a href="https://www.facebook.com/registreduquebec/" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-400">
                          Facebook
                        </a>
                        <a href="https://www.linkedin.com/company/registre-du-quebec" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-400">
                          LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="rounded-2xl p-8 bg-gray-50 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-2">Comment modifier ma fiche?</h3>
                    <p className="text-gray-600 text-sm">
                      Connectez-vous à votre compte et accédez à votre tableau de bord pour modifier les informations de votre entreprise.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-2">Comment ajouter mon entreprise?</h3>
                    <p className="text-gray-600 text-sm">
                      Cliquez sur &quot;Ajouter mon entreprise&quot; dans le menu et remplissez le formulaire.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-2">Comment signaler une erreur?</h3>
                    <p className="text-gray-600 text-sm">
                      Envoyez-nous un courriel avec le nom de l&apos;entreprise et la correction à apporter.
                    </p>
                  </div>

                  <Link href="/faq" className="block text-center text-sky-500 hover:text-sky-400 font-medium mt-4">
                    Voir toutes les FAQ →
                  </Link>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="mt-8 rounded-xl p-6 text-center border-2 border-[#020618] bg-white">
              <p className="text-gray-900">
                <strong>Délai de réponse:</strong> Nous répondons généralement dans un délai de 24 à 48 heures ouvrables.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 relative" style={{ background: 'var(--background-secondary)' }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'url(/images/background/background-overlay.png)',
              backgroundAttachment: 'fixed',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              opacity: 0.05,
            }}
          />
          <div className="relative z-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Vous êtes propriétaire d&apos;une entreprise?</h2>
            <p className="text-slate-400 mb-6">Ajoutez votre fiche gratuitement et augmentez votre visibilité.</p>
            <Link
              href="/entreprise/nouvelle"
              className="inline-block px-8 py-4 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-400 transition-colors"
            >
              + Ajouter mon entreprise
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
