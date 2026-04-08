import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdSense from '@/components/AdSense'
import { searchBusinesses, type Business } from '@/lib/search'

export const metadata: Metadata = {
  title: 'Rechercher une entreprise au Québec',
  description: 'Recherchez parmi plus de 46 000 entreprises québécoises de qualité. Trouvez des commerces, services et professionnels près de chez vous.',
}

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

interface SearchParams {
  q?: string
  page?: string
  categorie?: string
  ville?: string
}

function BusinessCard({ business }: { business: Business }) {
  const hasContact = business.phone || business.website

  return (
    <Link
      href={`/entreprise/${business.slug}`}
      className="block rounded-xl transition-all overflow-hidden group border"
      style={{ background: 'var(--background-secondary)', borderColor: 'rgba(128,128,128,0.15)' }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold group-hover:text-sky-500 transition-colors truncate" style={{ color: 'var(--foreground)' }}>
                {business.name}
              </h3>
              {business.ai_description && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-xs font-medium rounded-full">
                  Enrichie
                </span>
              )}
            </div>
            {business.city && (
              <p className="mt-1 flex items-center gap-2" style={{ color: 'var(--foreground-muted)' }}>
                <span>📍</span>
                {business.city}
              </p>
            )}
            {(business.ai_description || business.description) && (
              <p className="mt-2 text-sm line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>
                {business.ai_description || business.description}
              </p>
            )}

            {hasContact && (
              <div className="flex flex-wrap gap-2 mt-3">
                {business.phone && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 dark:text-green-400 text-xs font-medium rounded-full">
                    📞 Téléphone
                  </span>
                )}
                {business.website && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-sky-500/20 text-sky-500 dark:text-sky-400 text-xs font-medium rounded-full">
                    🌐 Site web
                  </span>
                )}
              </div>
            )}
          </div>

          {business.google_rating && (
            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-1 bg-amber-500/15 px-3 py-1.5 rounded-lg">
                <span className="text-amber-500 text-lg">★</span>
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                  {business.google_rating}
                </span>
              </div>
              {business.google_reviews_count && (
                <span className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  {business.google_reviews_count} avis
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function Pagination({
  currentPage,
  totalPages,
  query,
  category,
  city,
}: {
  currentPage: number
  totalPages: number
  query: string
  category?: string
  city?: string
}) {
  if (totalPages <= 1) return null

  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (page > 1) params.set('page', String(page))
    if (category) params.set('categorie', category)
    if (city) params.set('ville', city)
    const qs = params.toString()
    return qs ? `/recherche?${qs}` : '/recherche'
  }

  const maxVisible = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const endPage = Math.min(totalPages, startPage + maxVisible - 1)
  startPage = Math.max(1, endPage - maxVisible + 1)

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="px-4 py-2 rounded-lg font-medium border transition-colors"
          style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', borderColor: 'rgba(128,128,128,0.2)' }}
        >
          ← Précédent
        </Link>
      )}

      <div className="flex items-center gap-1">
        {startPage > 1 && (
          <>
            <Link
              href={buildUrl(1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg border font-medium"
              style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', borderColor: 'rgba(128,128,128,0.2)' }}
            >
              1
            </Link>
            {startPage > 2 && <span style={{ color: 'var(--foreground-muted)' }} className="px-2">...</span>}
          </>
        )}

        {pages.map((pageNum) => (
          <Link
            key={pageNum}
            href={buildUrl(pageNum)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
              currentPage === pageNum
                ? 'bg-sky-500 text-white'
                : 'border'
            }`}
            style={currentPage !== pageNum ? { background: 'var(--background-secondary)', color: 'var(--foreground)', borderColor: 'rgba(128,128,128,0.2)' } : undefined}
          >
            {pageNum}
          </Link>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span style={{ color: 'var(--foreground-muted)' }} className="px-2">...</span>}
            <Link
              href={buildUrl(totalPages)}
              className="w-10 h-10 flex items-center justify-center rounded-lg border font-medium"
              style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', borderColor: 'rgba(128,128,128,0.2)' }}
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="px-4 py-2 rounded-lg font-medium border transition-colors"
          style={{ background: 'var(--background-secondary)', color: 'var(--foreground)', borderColor: 'rgba(128,128,128,0.2)' }}
        >
          Suivant →
        </Link>
      )}
    </div>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const query = params.q || ''
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const category = params.categorie
  const city = params.ville

  const { businesses, total } = await searchBusinesses(query, page, category, city)
  const totalPages = Math.ceil(total / 20)
  const hasFilters = query || category || city

  return (
    <>
      <Header />

      <main className="min-h-screen pt-16" style={{ background: 'var(--background)' }}>
        {/* Search Header */}
        <section className="relative py-12 overflow-hidden" style={{ background: 'var(--background-secondary)' }}>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center" style={{ color: 'var(--foreground)' }}>
              Rechercher une entreprise
            </h1>
            <p className="text-center mb-8" style={{ color: 'var(--foreground-muted)' }}>
              Plus de 46 000 entreprises québécoises de qualité
            </p>

            <form action="/recherche" method="GET" className="glass rounded-2xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-5 border-b md:border-b-0 md:border-r" style={{ borderColor: 'rgba(128,128,128,0.15)' }}>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent)' }}>
                    Quoi?
                  </label>
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Restaurant, plombier, avocat..."
                    className="w-full bg-transparent outline-none text-base"
                    style={{ color: 'var(--foreground)' }}
                    autoComplete="off"
                  />
                </div>
                <div className="flex-1 p-5 border-b md:border-b-0 md:border-r" style={{ borderColor: 'rgba(128,128,128,0.15)' }}>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent)' }}>
                    Où?
                  </label>
                  <input
                    type="text"
                    name="ville"
                    defaultValue={city || ''}
                    placeholder="Montréal, Québec, Laval..."
                    className="w-full bg-transparent outline-none text-base"
                    style={{ color: 'var(--foreground)' }}
                    autoComplete="off"
                  />
                </div>
                <div className="flex-1 p-5 border-b md:border-b-0 md:border-r" style={{ borderColor: 'rgba(128,128,128,0.15)' }}>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent)' }}>
                    Catégorie
                  </label>
                  <select
                    name="categorie"
                    defaultValue={category || ''}
                    className="w-full bg-transparent outline-none text-base"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <option value="" style={{ background: 'var(--background)' }}>Toutes les catégories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.slug} style={{ background: 'var(--background)' }}>
                        {cat.label_fr}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white px-8 py-5 flex items-center justify-center gap-2 transition-all font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              {hasFilters ? (
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {total.toLocaleString('fr-CA')} résultat{total !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    {query && `pour « ${query} »`}
                    {city && ` à ${city}`}
                    {category && ` dans ${CATEGORIES.find(c => c.slug === category)?.label_fr || category}`}
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                    Recherchez une entreprise
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    Entrez un terme de recherche pour trouver des entreprises
                  </p>
                </div>
              )}

              {hasFilters && (
                <Link
                  href="/recherche"
                  className="text-sky-500 hover:text-sky-400 text-sm font-medium flex items-center gap-1"
                >
                  <span>✕</span> Réinitialiser
                </Link>
              )}
            </div>

            {businesses.length > 0 ? (
              <div className="space-y-4">
                {businesses.map((biz, index) => (
                  <div key={biz.id}>
                    <BusinessCard business={biz} />
                    {index === 2 && (
                      <div className="my-4">
                        <AdSense slot="8544579045" format="auto" responsive={true} style={{ minHeight: '90px' }} />
                      </div>
                    )}
                    {index === 7 && (
                      <div className="my-4">
                        <AdSense slot="8544579045" format="auto" responsive={true} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : hasFilters ? (
              <div className="text-center py-16 glass rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Aucun résultat trouvé
                </h3>
                <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
                  Essayez avec d&apos;autres termes de recherche ou moins de filtres
                </p>
                <Link
                  href="/recherche"
                  className="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-400 transition-colors"
                >
                  Nouvelle recherche
                </Link>
              </div>
            ) : (
              <div className="text-center py-16 glass rounded-xl">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Trouvez l&apos;entreprise parfaite
                </h3>
                <p style={{ color: 'var(--foreground-muted)' }}>
                  Utilisez le formulaire ci-dessus pour rechercher parmi plus de 46 000 entreprises de qualité
                </p>
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              query={query}
              category={category}
              city={city}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
