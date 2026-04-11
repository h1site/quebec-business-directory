import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServiceClient } from '@/lib/supabase/server'
import { categoryLabels } from '@/lib/category-labels'
import { slugToCity } from '@/lib/cities'
import { generateItemListSchema, generateListingBreadcrumbSchema } from '@/lib/schema'

interface Props {
  params: Promise<{
    citySlug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

export const revalidate = 604800 // 7 days

async function getBusinessesByCity(citySlug: string, page: number) {
  const supabase = createServiceClient()
  const limit = 20
  const offset = (page - 1) * limit
  const cityName = slugToCity(citySlug)
  const searchPattern = citySlug.replace(/-/g, '%')

  const { data, count, error } = await supabase
    .from('businesses')
    .select(
      'id, name, slug, city, region, google_rating, google_reviews_count, ai_description, website',
      { count: 'exact' }
    )
    .not('slug', 'is', null)
    .eq('verification_confidence', 'high')
    .or(`city.ilike.${cityName},city.ilike.%${searchPattern}%`)
    .order('google_rating', { ascending: false, nullsFirst: false })
    .order('google_reviews_count', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching businesses by city:', error)
    return { businesses: [], total: 0, actualCityName: cityName }
  }

  const actualCityName = data?.[0]?.city || cityName
  return {
    businesses: data || [],
    total: count || 0,
    actualCityName,
  }
}

async function getCityStats(citySlug: string) {
  const supabase = createServiceClient()
  const cityName = slugToCity(citySlug)
  const searchPattern = citySlug.replace(/-/g, '%')

  const { data } = await supabase
    .from('businesses')
    .select('google_rating, google_reviews_count')
    .not('slug', 'is', null)
    .eq('verification_confidence', 'high')
    .or(`city.ilike.${cityName},city.ilike.%${searchPattern}%`)

  if (!data || data.length === 0) return null

  const rated = data.filter(b => b.google_rating)
  const avgRating = rated.length > 0
    ? (rated.reduce((sum, b) => sum + (b.google_rating || 0), 0) / rated.length).toFixed(1)
    : null
  const totalReviews = data.reduce((sum, b) => sum + (b.google_reviews_count || 0), 0)

  return { avgRating, totalReviews, total: data.length }
}

async function getPopularCategories(citySlug: string) {
  const supabase = createServiceClient()
  const cityName = slugToCity(citySlug)
  const searchPattern = citySlug.replace(/-/g, '%')

  const { data } = await supabase
    .from('businesses')
    .select('main_category_slug')
    .not('slug', 'is', null)
    .eq('verification_confidence', 'high')
    .not('main_category_slug', 'is', null)
    .or(`city.ilike.${cityName},city.ilike.%${searchPattern}%`)
    .limit(500)

  if (!data) return []

  const counts: Record<string, number> = {}
  for (const b of data) {
    if (b.main_category_slug) {
      counts[b.main_category_slug] = (counts[b.main_category_slug] || 0) + 1
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([slug, count]) => ({
      slug,
      label: categoryLabels[slug] || slug,
      count,
    }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug } = await params
  const cityName = slugToCity(citySlug)
  const stats = await getCityStats(citySlug)

  const description = stats
    ? `Découvrez ${stats.total.toLocaleString('fr-CA')} entreprises à ${cityName}${stats.avgRating ? ` (note moyenne ${stats.avgRating}/5)` : ''}. Coordonnées, avis Google et informations détaillées.`
    : `Trouvez les meilleures entreprises à ${cityName}. Annuaire complet avec coordonnées, avis et informations détaillées.`

  return {
    title: `Entreprises à ${cityName} — Annuaire local`,
    description,
    alternates: { canonical: `https://registreduquebec.com/ville/${citySlug}` },
  }
}

export default async function CityPage({ params, searchParams }: Props) {
  const { citySlug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam || '1', 10))

  const [{ businesses, total, actualCityName }, popularCategories, stats] = await Promise.all([
    getBusinessesByCity(citySlug, page),
    getPopularCategories(citySlug),
    getCityStats(citySlug),
  ])
  const totalPages = Math.ceil(total / 20)

  if (total === 0) notFound()

  const buildUrl = (pageNum: number) => {
    if (pageNum === 1) return `/ville/${citySlug}`
    return `/ville/${citySlug}?page=${pageNum}`
  }

  const baseUrl = 'https://registreduquebec.com'
  const itemListSchema = generateItemListSchema(
    `Entreprises à ${actualCityName}`,
    `${baseUrl}/ville/${citySlug}`,
    businesses,
    total
  )
  const breadcrumbSchema = generateListingBreadcrumbSchema([
    { name: 'Accueil', url: baseUrl },
    { name: 'Entreprises', url: `${baseUrl}/recherche` },
    { name: actualCityName, url: `${baseUrl}/ville/${citySlug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': [itemListSchema, breadcrumbSchema] }) }}
      />

      <Header />

      <main className="min-h-screen bg-slate-950 pt-16">
        {/* Hero Section */}
        <section className="relative bg-slate-900 py-12 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-4">
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

            <div className="flex flex-wrap gap-6 text-slate-400 text-lg">
              <span>{total.toLocaleString('fr-CA')} entreprise{total !== 1 ? 's' : ''}</span>
              {stats?.avgRating && (
                <span className="flex items-center gap-1">
                  <span className="text-amber-400">★</span>
                  {stats.avgRating}/5 en moyenne
                </span>
              )}
              {stats?.totalReviews ? (
                <span>{stats.totalReviews.toLocaleString('fr-CA')} avis Google</span>
              ) : null}
            </div>

            <p className="text-slate-400 mt-4 max-w-3xl">
              {actualCityName} compte {total.toLocaleString('fr-CA')} entreprises inscrites au Registre du Québec
              {stats?.avgRating ? `, avec une note moyenne de ${stats.avgRating}/5` : ''}
              {stats?.totalReviews ? ` et un total de ${stats.totalReviews.toLocaleString('fr-CA')} avis clients` : ''}.
            </p>
          </div>
        </section>

        {/* Popular Categories — now linking to combo pages */}
        {popularCategories.length > 0 && (
          <section className="py-8 border-b border-slate-800">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-xl font-bold text-white mb-4">
                Catégories populaires à {actualCityName}
              </h2>
              <div className="flex flex-wrap gap-3">
                {popularCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categorie/${cat.slug}/${citySlug}`}
                    className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 hover:border-sky-500/50 text-slate-300 hover:text-sky-400 text-sm font-medium transition-all"
                  >
                    {cat.label} ({cat.count})
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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
                            <span className="font-bold text-white">{business.google_rating}</span>
                          </div>
                          {business.google_reviews_count && (
                            <span className="text-xs text-slate-500 mt-1">{business.google_reviews_count} avis</span>
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
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
