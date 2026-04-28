import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Pourquoi Registre du Québec — gratuit, vérifié, indépendant',
  description: 'Comparez Registre du Québec aux autres annuaires : 100% gratuit, aucun favoritisme payant, données vérifiées et indépendant de toute agence.',
  alternates: {
    canonical: 'https://registreduquebec.com/pourquoi-registre-du-quebec',
  },
}

const COMPARISON = [
  { feature: 'Frais d\'inscription pour les entreprises', us: '0 $ — toujours gratuit', them: 'Frais d\'inscription unique payant' },
  { feature: 'Classement basé sur paiement', us: 'Jamais', them: 'Variable selon les répertoires' },
  { feature: 'Volume de fiches', us: '7 500+ vérifiées', them: 'Souvent quelques centaines' },
  { feature: 'Avis Google intégrés', us: 'Oui, sur chaque fiche', them: 'Rarement' },
  { feature: 'Vérification des données', us: 'Multi-sources + IA', them: 'Auto-déclaration' },
  { feature: 'Contenu unique par fiche', us: 'Description et analyse IA', them: 'Aucune' },
  { feature: 'Blog et guides SEO', us: '16+ articles + palmarès', them: 'Aucun' },
  { feature: 'Bilingue FR/EN', us: 'Oui', them: 'FR seulement (souvent)' },
  { feature: 'Indépendance', us: 'Projet indépendant, aucune agence', them: 'Souvent opéré par une agence' },
  { feature: 'Réclamation de fiche', us: 'Gratuite, en ligne', them: 'Variable' },
]

export default function PourquoiPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-16" style={{ background: 'var(--background)' }}>
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero */}
          <header className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest mb-4">
              Pourquoi nous choisir
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4" style={{ color: 'var(--foreground)' }}>
              Le seul annuaire 100% gratuit et indépendant du Québec
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              Aucun frais. Aucun classement payant. Aucune agence derrière nous. Juste un annuaire complet, vérifié et utile pour tous les Québécois.
            </p>
          </header>

          {/* 3 pillars */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-4xl mb-3">💸</div>
              <h2 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>100% gratuit</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Inscription, réclamation, mise à jour : tout est gratuit, à vie. Aucun abonnement, aucun frais caché.
              </p>
            </div>
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-4xl mb-3">⚖️</div>
              <h2 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>Aucun favoritisme</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Le tri repose sur les avis Google, la qualité des données et la pertinence — jamais sur le paiement.
              </p>
            </div>
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-4xl mb-3">🛡️</div>
              <h2 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>Données vérifiées</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Chaque fiche est croisée avec plusieurs sources : Google, registres officiels, vérification automatisée.
              </p>
            </div>
          </section>

          {/* Comparison table */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: 'var(--foreground)' }}>
              Comment nous comparons-nous aux autres répertoires?
            </h2>
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <th className="text-left p-4 font-bold" style={{ color: 'var(--foreground)' }}>Critère</th>
                    <th className="text-left p-4 font-bold text-sky-400">Registre du Québec</th>
                    <th className="text-left p-4 font-bold" style={{ color: 'var(--foreground-muted)' }}>Autres répertoires</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? '' : ''} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="p-4 font-medium" style={{ color: 'var(--foreground)' }}>{row.feature}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                          <span>✓</span> {row.us}
                        </span>
                      </td>
                      <td className="p-4" style={{ color: 'var(--foreground-muted)' }}>{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-3 text-center" style={{ color: 'var(--foreground-muted)' }}>
              Comparaison basée sur les pratiques courantes de plusieurs annuaires québécois en 2026.
            </p>
          </section>

          {/* Why independence matters */}
          <section className="mb-16 rounded-2xl p-8" style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Pourquoi l&apos;indépendance compte
            </h2>
            <p className="leading-[1.8] mb-4" style={{ color: 'var(--foreground-muted)' }}>
              Beaucoup d&apos;annuaires québécois sont opérés par des agences de design, de marketing ou de communication. Cela crée un <strong style={{ color: 'var(--foreground)' }}>conflit d&apos;intérêt structurel</strong> : leurs propres clients (qui paient l&apos;agence) tendent à mieux ressortir, et le service d&apos;annuaire devient un canal d&apos;upsell vers d&apos;autres prestations payantes.
            </p>
            <p className="leading-[1.8]" style={{ color: 'var(--foreground-muted)' }}>
              <strong style={{ color: 'var(--foreground)' }}>Registre du Québec est volontairement indépendant.</strong> Pas de clients à favoriser, pas de service à vendre, pas de modèle « payez plus pour être visible ». Un répertoire fait pour les Québécois, financé par la publicité non intrusive (Google AdSense) et par des partenariats clairement identifiés.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Prêt à rejoindre le plus grand annuaire indépendant du Québec?
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/entreprise/nouvelle"
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-400 transition-colors no-underline"
              >
                Ajouter mon entreprise gratuitement →
              </Link>
              <Link
                href="/a-propos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors no-underline"
                style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                En savoir plus sur nous
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
