import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdSense from '@/components/AdSense'
import {
  HeroSection,
  CategoriesSection,
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

async function getBlogArticles() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_articles')
    .select('slug, title_fr, thumbnail_url')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(16)
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
  const blogArticles = await getBlogArticles()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://registreduquebec.com/#website',
        url: 'https://registreduquebec.com',
        name: 'Registre du Québec',
        description: 'Annuaire de plus de 7 000 entreprises québécoises vérifiées.',
        publisher: { '@id': 'https://registreduquebec.com/#organization' },
        inLanguage: 'fr-CA',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://registreduquebec.com/recherche?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://registreduquebec.com/#organization',
        name: 'Registre du Québec',
        alternateName: 'Registre des entreprises du Québec',
        url: 'https://registreduquebec.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://registreduquebec.com/images/logos/logo.webp',
          width: 512,
          height: 512,
        },
        foundingDate: '2025',
        founder: {
          '@type': 'Person',
          name: 'Sébastien Ross',
        },
        sameAs: [
          'https://www.facebook.com/registreduquebec/',
          'https://www.linkedin.com/company/registre-du-quebec',
          'https://www.facebook.com/groups/registreduquebec',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'info@h1site.com',
          contactType: 'Customer Service',
          availableLanguage: ['French', 'English'],
          areaServed: 'CA',
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Vaudreuil-Dorion',
          addressRegion: 'QC',
          addressCountry: 'CA',
        },
        knowsAbout: [
          'Entreprises du Québec',
          'Annuaire professionnel',
          'Immatriculation d\'entreprise',
          'PME québécoises',
        ],
      },
    ],
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
        <CategoriesSection categories={CATEGORIES} />

        {/* Ad - after categories + cities */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdSense slot="8544579045" format="auto" responsive={true} />
        </div>

        {/* Featured Businesses - critical for Google crawling internal links */}
        {featuredBusinesses.length > 0 && (
          <section className="py-[100px] relative" style={{ background: 'var(--background-secondary)' }}>
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
            <div className="relative z-10 max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Entreprises populaires au Québec</h2>
              <p className="text-slate-400 text-center mb-8">Découvrez les entreprises les mieux notées par leurs clients</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredBusinesses.map((biz) => (
                  <Link
                    key={biz.slug}
                    href={`/entreprise/${biz.slug}`}
                    className="glass rounded-xl p-3 hover:bg-white/10 transition-all no-underline"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white truncate uppercase text-xs tracking-wide">{biz.name}</h3>
                        <p className="text-slate-400 text-xs">{biz.city}</p>
                      </div>
                      {biz.google_rating && (
                        <span className="text-amber-400 text-xs font-bold shrink-0 ml-2">★ {biz.google_rating}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Ad - after featured businesses */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdSense slot="8544579045" format="auto" responsive={true} />
        </div>

        {/* Blog articles grid */}
        {blogArticles.length > 0 && (
          <section className="py-[100px] px-4" style={{ background: 'var(--background)' }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                  Guides et articles pour entrepreneurs
                </h2>
                <p style={{ color: 'var(--foreground-muted)' }}>
                  Conseils, tendances et ressources pour les PME québécoises
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {blogArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/blogue/${article.slug}`}
                    className="group flex flex-col rounded-xl overflow-hidden transition-transform hover:scale-[1.02] no-underline"
                    style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {article.thumbnail_url && (
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.thumbnail_url}
                          alt={article.title_fr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 p-4">
                      <h3 className="text-sm font-bold mb-3 leading-snug line-clamp-3" style={{ color: 'var(--foreground)' }}>
                        {article.title_fr}
                      </h3>
                      <span className="mt-auto inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold group-hover:bg-sky-400 transition-colors">
                        Lire →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link
                  href="/blogue"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-400 transition-colors no-underline"
                >
                  Voir tous les articles →
                </Link>
              </div>
            </div>
          </section>
        )}

      </main>

      <Footer />
    </>
  )
}
