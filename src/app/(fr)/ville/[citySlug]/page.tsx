import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServiceClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{
    citySlug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

// ISR: Revalidate every 24 hours
export const revalidate = 86400

// Convert slug back to city name for display
function slugToCity(slug: string): string {
  // Common city name mappings
  const cityMappings: Record<string, string> = {
    'montreal': 'Montréal',
    'quebec': 'Québec',
    'laval': 'Laval',
    'gatineau': 'Gatineau',
    'longueuil': 'Longueuil',
    'sherbrooke': 'Sherbrooke',
    'saguenay': 'Saguenay',
    'levis': 'Lévis',
    'trois-rivieres': 'Trois-Rivières',
    'terrebonne': 'Terrebonne',
    'saint-jean-sur-richelieu': 'Saint-Jean-sur-Richelieu',
    'repentigny': 'Repentigny',
    'brossard': 'Brossard',
    'drummondville': 'Drummondville',
    'saint-jerome': 'Saint-Jérôme',
    'granby': 'Granby',
    'blainville': 'Blainville',
    'saint-hyacinthe': 'Saint-Hyacinthe',
    'shawinigan': 'Shawinigan',
    'dollard-des-ormeaux': 'Dollard-Des Ormeaux',
    'rimouski': 'Rimouski',
    'victoriaville': 'Victoriaville',
    'saint-eustache': 'Saint-Eustache',
    'mascouche': 'Mascouche',
    'chicoutimi': 'Chicoutimi',
  }

  if (cityMappings[slug]) {
    return cityMappings[slug]
  }

  // Default: capitalize each word and replace hyphens
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function getBusinessesByCity(citySlug: string, page: number) {
  const supabase = createServiceClient()
  const limit = 20
  const offset = (page - 1) * limit

  // Try to find businesses matching the city slug
  // We search with ILIKE to be flexible with accents and variations
  const cityName = slugToCity(citySlug)

  // Build pattern for flexible matching
  const searchPattern = citySlug.replace(/-/g, '%')

  const { data, count, error } = await supabase
    .from('businesses')
    .select(
      'id, name, slug, city, region, google_rating, google_reviews_count, ai_description, website',
      { count: 'exact' }
    )
    .not('slug', 'is', null)
    .not('ai_enriched_at', 'is', null)
    .not('website', 'is', null)
    .or(`city.ilike.${cityName},city.ilike.%${searchPattern}%`)
    .order('google_rating', { ascending: false, nullsFirst: false })
    .order('google_reviews_count', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching businesses by city:', error)
    return { businesses: [], total: 0, actualCityName: cityName }
  }

  // Get the actual city name from first result if available
  const actualCityName = data?.[0]?.city || cityName

  return {
    businesses: data || [],
    total: count || 0,
    actualCityName
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug } = await params
  const cityName = slugToCity(citySlug)

  return {
    title: `Entreprises à ${cityName} - Registre du Québec`,
    description: `Trouvez les meilleures entreprises à ${cityName}. Annuaire complet avec coordonnées, avis et informations détaillées.`,
  }
}

export default async function CityPage({ params, searchParams }: Props) {
  const { citySlug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam || '1', 10))

  const { businesses, total, actualCityName } = await getBusinessesByCity(citySlug, page)
  const totalPages = Math.ceil(total / 20)

  // If no businesses found, show 404
  if (total === 0) {
    notFound()
  }

  const buildUrl = (pageNum: number) => {
    if (pageNum === 1) return `/ville/${citySlug}`
    return `/ville/${citySlug}?page=${pageNum}`
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-950 pt-16">
        {/* Hero Section */}
        <section className="relative bg-slate-900 py-12 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="text-sm mb-6 flex items-center gap-2 text-slate-400">
              <Link href="/" className="hover:text-sky-400 transition-colors">Accueil</Link>
              <span>›</span>
              <Link href="/recherche" className="hover:text-sky-400 transition-colors">Entreprises</Link>
              <span>›</span>
              <span className="text-white">{actualCityName}</span>
            </nav>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Entreprises à {actualCityName}
            </h1>
            <p className="text-slate-400 text-lg">
              {total.toLocaleString('fr-CA')} entreprise{total !== 1 ? 's' : ''} trouvée{total !== 1 ? 's' : ''}
            </p>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="space-y-4">
              {businesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/entreprise/${business.slug}`}
                  className="block glass rounded-xl hover:bg-white/10 transition-all overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-semibold text-white group-hover:text-sky-400 transition-colors">
                          {business.name}
                        </h2>
                        {business.region && (
                          <p className="text-slate-400 mt-1 flex items-center gap-2">
                            <span>📍</span>
                            {business.city}, {business.region}
                          </p>
                        )}
                        {business.ai_description && (
                          <p className="text-slate-500 mt-2 text-sm line-clamp-2">
                            {business.ai_description}
                          </p>
                        )}
                      </div>

                      {business.google_rating && (
                        <div className="flex flex-col items-end shrink-0">
                          <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1.5 rounded-lg">
                            <span className="text-amber-400 text-lg">★</span>
                            <span className="font-bold text-white">
                              {business.google_rating}
                            </span>
                          </div>
                          {business.google_reviews_count && (
                            <span className="text-xs text-slate-500 mt-1">
                              {business.google_reviews_count} avis
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={buildUrl(page - 1)}
                    className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 font-medium text-white border border-slate-700"
                  >
                    ← Précédent
                  </Link>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={buildUrl(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    )
                  })}
                </div>

                {page < totalPages && (
                  <Link
                    href={buildUrl(page + 1)}
                    className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 font-medium text-white border border-slate-700"
                  >
                    Suivant →
                  </Link>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 glass rounded-2xl p-8 text-center">
              <h2 className="text-xl font-bold text-white mb-3">
                Vous ne trouvez pas ce que vous cherchez?
              </h2>
              <p className="text-slate-400 mb-6">
                Utilisez notre recherche avancée pour affiner vos résultats
              </p>
              <Link
                href={`/recherche?ville=${encodeURIComponent(actualCityName)}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5"
              >
                Recherche avancée
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
