import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez le Registre d\'entreprises du Québec, l\'annuaire le plus complet des entreprises québécoises avec plus de 7 000 fiches vérifiées.',
}

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-16" style={{ background: 'var(--background)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>À propos</h1>
            <p className="text-xl" style={{ color: 'var(--foreground-muted)' }}>
              L&apos;annuaire le plus complet des entreprises québécoises
            </p>
          </div>

          <div className="rounded-2xl p-8 md:p-12" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Notre mission</h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--foreground-muted)' }}>
                Le Registre d&apos;entreprises du Québec a pour mission de faciliter la découverte et la mise en relation
                avec les entreprises québécoises. Nous croyons que chaque entreprise, qu&apos;elle soit petite ou grande,
                mérite d&apos;être visible et accessible.
              </p>
              <p className="leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Notre plateforme gratuite permet aux consommateurs de trouver facilement les entreprises dont ils ont besoin,
                tout en offrant aux propriétaires d&apos;entreprises un outil pour gérer leur présence en ligne.
              </p>
            </section>

            <section className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl p-6 text-center bg-sky-500/10 border border-sky-500/20">
                  <div className="text-4xl font-bold text-sky-400 mb-2">7 000+</div>
                  <div style={{ color: 'var(--foreground-muted)' }}>Entreprises vérifiées</div>
                </div>
                <div className="rounded-xl p-6 text-center bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">17</div>
                  <div style={{ color: 'var(--foreground-muted)' }}>Régions du Québec</div>
                </div>
                <div className="rounded-xl p-6 text-center bg-purple-500/10 border border-purple-500/20">
                  <div className="text-4xl font-bold text-purple-400 mb-2">100%</div>
                  <div style={{ color: 'var(--foreground-muted)' }}>Gratuit</div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>Ce que nous offrons</h2>
              <div className="space-y-4">
                {[
                  { icon: '🔍', title: 'Recherche avancée', desc: 'Trouvez facilement des entreprises par nom, catégorie, ville ou région.' },
                  { icon: '📍', title: 'Informations vérifiées', desc: 'Adresse, téléphone, site web, heures d\'ouverture, avis Google et plus encore.' },
                  { icon: '✏️', title: 'Gestion de fiche', desc: 'Les propriétaires peuvent réclamer et gérer leur fiche gratuitement.' },
                  { icon: '⭐', title: 'Avis et évaluations', desc: 'Consultez les avis Google pour choisir les meilleures entreprises.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
                      <span className="text-xl">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{item.title}</h3>
                      <p style={{ color: 'var(--foreground-muted)' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Sources de données</h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--foreground-muted)' }}>
                Nos données proviennent de plusieurs sources fiables :
              </p>
              <ul className="list-disc list-inside space-y-2" style={{ color: 'var(--foreground-muted)' }}>
                <li>Registraire des entreprises du Québec (données publiques gouvernementales)</li>
                <li>Google Places API (informations et avis)</li>
                <li>Vérification par intelligence artificielle</li>
                <li>Soumissions directes par les propriétaires d&apos;entreprises</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Nous contacter</h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--foreground-muted)' }}>
                Vous avez des questions, des suggestions ou besoin d&apos;aide? N&apos;hésitez pas à nous contacter.
              </p>
              <ul className="list-none space-y-2" style={{ color: 'var(--foreground-muted)' }}>
                <li>✉️ <a href="mailto:info@h1site.com" className="text-sky-400 hover:text-sky-300 underline">info@h1site.com</a></li>
                <li>📍 Vaudreuil-Dorion, Québec, Canada</li>
              </ul>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/entreprise/nouvelle"
              className="inline-block px-8 py-4 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-400 transition-colors"
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
