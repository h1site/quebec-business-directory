import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdSense from '@/components/AdSense'
import {
  HeroSection,
  CategoriesSection,
  CitiesSection,
  StatsSection,
  AboutSection,
} from '@/components/home'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 86400 // 24 hours

async function getFeaturedBusinesses() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('slug, name, city, main_category_slug, google_rating')
    .eq('verification_confidence', 'high')
    .not('ai_description', 'is', null)
    .not('google_rating', 'is', null)
    .gte('google_rating', 4)
    .order('google_reviews_count', { ascending: false })
    .limit(30)
  return data || []
}

const TOTAL_BUSINESSES = 7000

// Static categories - update when categories change
const CATEGORIES = [
  { id: '1', slug: 'agriculture-et-environnement', label_fr: 'Agriculture et environnement' },
  { id: '2', slug: 'arts-medias-et-divertissement', label_fr: 'Arts, médias et divertissement' },
  { id: '3', slug: 'automobile-et-transport', label_fr: 'Automobile et transport' },
  { id: '4', slug: 'commerce-de-detail', label_fr: 'Commerce de détail' },
  { id: '5', slug: 'construction-et-renovation', label_fr: 'Construction et rénovation' },
  { id: '6', slug: 'education-et-formation', label_fr: 'Éducation et formation' },
  { id: '7', slug: 'finance-assurance-et-juridique', label_fr: 'Finance, assurance et juridique' },
  { id: '8', slug: 'immobilier', label_fr: 'Immobilier' },
  { id: '9', slug: 'industrie-fabrication-et-logistique', label_fr: 'Industrie, fabrication et logistique' },
  { id: '10', slug: 'maison-et-services-domestiques', label_fr: 'Maison et services domestiques' },
  { id: '11', slug: 'organismes-publics-et-communautaires', label_fr: 'Organismes publics et communautaires' },
  { id: '12', slug: 'restauration-et-alimentation', label_fr: 'Restauration et alimentation' },
  { id: '13', slug: 'sante-et-bien-etre', label_fr: 'Santé et bien-être' },
  { id: '14', slug: 'services-funeraires', label_fr: 'Services funéraires' },
  { id: '15', slug: 'services-professionnels', label_fr: 'Services professionnels' },
  { id: '16', slug: 'soins-a-domicile', label_fr: 'Soins à domicile' },
  { id: '17', slug: 'sports-et-loisirs', label_fr: 'Sports et loisirs' },
  { id: '18', slug: 'technologie-et-informatique', label_fr: 'Technologie et informatique' },
  { id: '19', slug: 'tourisme-et-hebergement', label_fr: 'Tourisme et hébergement' },
]

export default async function HomePage() {
  const featuredBusinesses = await getFeaturedBusinesses()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Registre des entreprises du Québec',
    url: 'https://registreduquebec.com',
    description: 'Trouvez facilement parmi plus de 46 000 entreprises québécoises de qualité.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://registreduquebec.com/recherche?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main>
        <HeroSection totalBusinesses={TOTAL_BUSINESSES} />

        {/* TeckBlaze Promo Banner */}
        <section className="py-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <a
              href="https://teckblaze.com?utm_source=registreduquebec&utm_medium=banner&utm_campaign=homepage"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col md:flex-row items-center gap-6 rounded-2xl p-6 md:p-8 no-underline transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(168,85,247,0.1) 100%)', border: '1px solid rgba(14,165,233,0.2)' }}
            >
              <img
                src="/images/logos/logo-teckblaze.png"
                alt="TeckBlaze - SEO Audit"
                width={80}
                height={80}
                className="rounded-xl shrink-0"
              />
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">Partenaire</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Audit SEO & GEO (IA) de votre site pour le prix d&apos;un café
                </h3>
                <p className="text-slate-400 text-sm mb-3">
                  75+ vérifications en un scan : SEO technique, Core Web Vitals, accessibilité, optimisation pour ChatGPT et Google. Score global, recommandations et export PDF.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300">🔍 SEO technique</span>
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300">🤖 GEO pour IA</span>
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300">⚡ Core Web Vitals</span>
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300">♿ Accessibilité</span>
                </div>
              </div>
              <div className="shrink-0 text-center">
                <span className="block text-3xl font-extrabold text-white">1,99$</span>
                <span className="block text-xs text-slate-400 mb-3">par scan · sans abonnement</span>
                <span className="inline-block px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg transition-colors text-sm">
                  Scanner mon site →
                </span>
              </div>
            </a>
          </div>
        </section>

        <CategoriesSection categories={CATEGORIES} />

        {/* Ad - after categories */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdSense slot="8544579045" format="auto" responsive={true} />
        </div>

        <CitiesSection />
        <StatsSection />

        {/* Ad - after stats */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdSense slot="8544579045" format="auto" responsive={true} />
        </div>

        {/* Featured Businesses - critical for Google crawling internal links */}
        {featuredBusinesses.length > 0 && (
          <section className="py-12" style={{ background: 'var(--background-secondary)' }}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Entreprises populaires au Québec</h2>
              <p className="text-slate-400 text-center mb-8">Découvrez les entreprises les mieux notées par leurs clients</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredBusinesses.map((biz) => (
                  <Link
                    key={biz.slug}
                    href={`/entreprise/${biz.slug}`}
                    className="glass rounded-xl p-4 hover:bg-white/10 transition-all no-underline"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white truncate">{biz.name}</h3>
                        <p className="text-slate-400 text-sm">{biz.city}</p>
                      </div>
                      {biz.google_rating && (
                        <span className="text-amber-400 text-sm font-bold shrink-0 ml-2">★ {biz.google_rating}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Ad - before about */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdSense slot="8544579045" format="auto" responsive={true} />
        </div>

        <AboutSection />
      </main>

      <Footer />
    </>
  )
}
