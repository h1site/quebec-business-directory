import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServiceClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'
import { slugToCity } from '@/lib/cities'
import { generateItemListSchema, generateListingBreadcrumbSchema } from '@/lib/schema'

interface Props {
  params: Promise<{
    categorySlug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

export const revalidate = 86400

async function getCategory(slug: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_fr, label_en')
    .eq('slug', slug)
    .single()
  return data
}

async function getBusinessesByCategory(categorySlug: string, page: number) {
  const supabase = createServiceClient()
  const limit = 20
  const offset = (page - 1) * limit

  const { data, count, error } = await supabase
    .from('businesses')
    .select(
      'id, name, slug, city, region, google_rating, google_reviews_count, ai_description, website',
      { count: 'exact' }
    )
    .not('slug', 'is', null)
    .eq('main_category_slug', categorySlug)
    .not('website', 'is', null)
    .order('google_rating', { ascending: false, nullsFirst: false })
    .order('google_reviews_count', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching businesses by category:', error)
    return { businesses: [], total: 0 }
  }

  return {
    businesses: data || [],
    total: count || 0,
  }
}

async function getPopularCitiesForCategory(categorySlug: string) {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('businesses')
    .select('city')
    .eq('main_category_slug', categorySlug)
    .not('slug', 'is', null)
    .not('website', 'is', null)
    .not('city', 'is', null)
    .limit(1000)

  if (!data) return []

  const counts: Record<string, number> = {}
  for (const b of data) {
    if (b.city) {
      counts[b.city] = (counts[b.city] || 0) + 1
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([city, count]) => ({
      name: city,
      slug: generateSlug(city),
      count,
    }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params
  const category = await getCategory(categorySlug)

  if (!category) {
    return { title: 'Catégorie non trouvée' }
  }

  const { total } = await getBusinessesByCategory(categorySlug, 1)

  return {
    title: `${category.label_fr} - Entreprises au Québec`,
    description: `${total.toLocaleString('fr-CA')} entreprises de ${category.label_fr} au Québec. Comparez les avis, coordonnées et services.`,
    alternates: { canonical: `https://registreduquebec.com/categorie/${categorySlug}` },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categorySlug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam || '1', 10))

  const category = await getCategory(categorySlug)
  if (!category) notFound()

  const [{ businesses, total }, popularCities] = await Promise.all([
    getBusinessesByCategory(categorySlug, page),
    getPopularCitiesForCategory(categorySlug),
  ])
  const totalPages = Math.ceil(total / 20)

  const buildUrl = (pageNum: number) => {
    if (pageNum === 1) return `/categorie/${categorySlug}`
    return `/categorie/${categorySlug}?page=${pageNum}`
  }

  const baseUrl = 'https://registreduquebec.com'
  const itemListSchema = generateItemListSchema(
    category.label_fr,
    `${baseUrl}/categorie/${categorySlug}`,
    businesses,
    total
  )
  const breadcrumbSchema = generateListingBreadcrumbSchema([
    { name: 'Accueil', url: baseUrl },
    { name: 'Entreprises', url: `${baseUrl}/recherche` },
    { name: category.label_fr, url: `${baseUrl}/categorie/${categorySlug}` },
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
              <span className="text-white">{category.label_fr}</span>
            </nav>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {category.label_fr}
            </h1>
            <p className="text-slate-400 text-lg">
              {total.toLocaleString('fr-CA')} entreprise{total !== 1 ? 's' : ''} au Québec
            </p>
          </div>
        </section>

        {/* Popular cities for this category — linking to combo pages */}
        {popularCities.length > 0 && (
          <section className="py-8 border-b border-slate-800">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-xl font-bold text-white mb-4">
                {category.label_fr} par ville
              </h2>
              <div className="flex flex-wrap gap-3">
                {popularCities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/categorie/${categorySlug}/${city.slug}`}
                    className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 hover:border-sky-500/50 text-slate-300 hover:text-sky-400 text-sm font-medium transition-all"
                  >
                    {city.name} ({city.count})
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            {businesses.length > 0 ? (
              <div className="space-y-4">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className="glass rounded-xl hover:bg-white/10 transition-all overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-semibold">
                            <Link
                              href={`/entreprise/${business.slug}`}
                              className="text-white hover:text-sky-400 transition-colors"
                            >
                              {business.name}
                            </Link>
                          </h2>
                          {business.city && (
                            <p className="text-slate-400 mt-1 flex items-center gap-2">
                              <span>📍</span>
                              <Link
                                href={`/ville/${generateSlug(business.city)}`}
                                className="hover:text-sky-400 transition-colors"
                              >
                                {business.city}
                              </Link>
                              {business.region && `, ${business.region}`}
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 glass rounded-xl">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Aucune entreprise trouvée
                </h3>
                <p className="text-slate-400 mb-6">
                  Aucune entreprise dans cette catégorie pour le moment
                </p>
                <Link
                  href="/recherche"
                  className="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-400 transition-colors"
                >
                  Rechercher
                </Link>
              </div>
            )}

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
                href={`/recherche?categorie=${categorySlug}`}
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
