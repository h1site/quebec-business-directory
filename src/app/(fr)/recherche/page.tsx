import { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Rechercher une entreprise au Québec',
  description: 'Recherchez parmi plus de 600 000 entreprises québécoises. Trouvez des commerces, services et professionnels près de chez vous.',
}

interface SearchParams {
  q?: string
  page?: string
  categorie?: string
  ville?: string
}

function generateSlug(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function searchBusinesses(query: string, page: number, category?: string, city?: string) {
  const supabase = createServiceClient()
  const limit = 20
  const offset = (page - 1) * limit

  // If no filters at all, don't run a query - show empty state
  if (!query && !category && !city) {
    return { businesses: [], total: 0, noQuery: true }
  }

  // If we have a search query
  if (query) {
    // Clean up query for better matching
    const cleanQuery = query.trim()

    // Try exact name match first (for full company names like "1 SOLUTION LOGISTICS INC.")
    let exactBuilder = supabase
      .from('businesses')
      .select('id, name, slug, city, main_category_slug, google_rating, google_reviews_count, description, phone, website', { count: 'estimated' })
      .ilike('name', cleanQuery)
      .not('slug', 'is', null)
      .not('city', 'is', null)

    if (category) {
      exactBuilder = exactBuilder.eq('main_category_slug', category)
    }
    if (city) {
      const citySearchTerm = city
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      exactBuilder = exactBuilder.ilike('city', `%${citySearchTerm}%`)
    }

    const exactResult = await exactBuilder
      .order('google_rating', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    if (!exactResult.error && exactResult.data && exactResult.data.length > 0) {
      return { businesses: exactResult.data, total: exactResult.count || 0 }
    }

    // Try full-text search
    let queryBuilder = supabase
      .from('businesses')
      .select('id, name, slug, city, main_category_slug, google_rating, google_reviews_count, description, phone, website', { count: 'estimated' })
      .textSearch('search_vector', cleanQuery, { type: 'websearch' })
      .not('slug', 'is', null)
      .not('city', 'is', null)

    if (category) {
      queryBuilder = queryBuilder.eq('main_category_slug', category)
    }
    if (city) {
      const citySearchTerm = city
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      queryBuilder = queryBuilder.ilike('city', `%${citySearchTerm}%`)
    }

    const { data, count, error } = await queryBuilder
      .order('google_rating', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    // If full-text search returns results, use them
    if (!error && data && data.length > 0) {
      return { businesses: data, total: count || 0 }
    }

    // Fallback: search by name, description, or category with ILIKE (partial match)
    let fallbackBuilder = supabase
      .from('businesses')
      .select('id, name, slug, city, main_category_slug, google_rating, google_reviews_count, description, phone, website', { count: 'estimated' })
      .not('slug', 'is', null)
      .not('city', 'is', null)
      .or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,main_category_slug.ilike.%${cleanQuery}%`)

    if (category) {
      fallbackBuilder = fallbackBuilder.eq('main_category_slug', category)
    }
    if (city) {
      const citySearchTerm = city
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      fallbackBuilder = fallbackBuilder.ilike('city', `%${citySearchTerm}%`)
    }

    const fallbackResult = await fallbackBuilder
      .order('google_rating', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    if (fallbackResult.error) {
      console.error('Fallback search error:', fallbackResult.error)
      return { businesses: [], total: 0 }
    }

    return { businesses: fallbackResult.data || [], total: fallbackResult.count || 0 }
  }

  // No search query but has filters - apply them
  let queryBuilder = supabase
    .from('businesses')
    .select('id, name, slug, city, main_category_slug, google_rating, google_reviews_count, description, phone, website', { count: 'estimated' })
    .not('slug', 'is', null)
    .not('city', 'is', null)

  if (category) {
    queryBuilder = queryBuilder.eq('main_category_slug', category)
  }
  if (city) {
    const citySearchTerm = city
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
    queryBuilder = queryBuilder.ilike('city', `%${citySearchTerm}%`)
  }

  const { data, count, error } = await queryBuilder
    .order('google_rating', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Search error:', error)
    return { businesses: [], total: 0 }
  }

  return { businesses: data || [], total: count || 0 }
}

async function getCategories() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_fr')
    .order('label_fr')
  return data || []
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const query = params.q || ''
  const page = parseInt(params.page || '1', 10)
  const category = params.categorie
  const city = params.ville

  const [{ businesses, total }, categories] = await Promise.all([
    searchBusinesses(query, page, category, city),
    getCategories(),
  ])

  const totalPages = Math.ceil(total / 20)

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Search Header */}
        <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white py-12 overflow-hidden">
          {/* Background Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url(/images/background/background-overlay.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
              Rechercher une entreprise
            </h1>
            <p className="text-blue-200 text-center mb-8">
              Plus de 600 000 entreprises québécoises à découvrir
            </p>

            {/* Search Form */}
            <form action="/recherche" method="GET" className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
                    Quoi?
                  </label>
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Restaurant, plombier, avocat..."
                    className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
                  />
                </div>
                <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
                    Où?
                  </label>
                  <input
                    type="text"
                    name="ville"
                    defaultValue={city || ''}
                    placeholder="Montréal, Québec, Laval..."
                    className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
                  />
                </div>
                <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
                    Catégorie
                  </label>
                  <select
                    name="categorie"
                    defaultValue={category || ''}
                    className="w-full text-gray-900 outline-none text-base bg-transparent"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.label_fr}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 flex items-center justify-center gap-2 transition-all font-semibold"
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
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              {query || category || city ? (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {total.toLocaleString('fr-CA')} résultat{total !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {query && `pour "${query}"`}
                    {city && ` à ${city}`}
                    {category && ` dans ${category}`}
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Recherchez une entreprise
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Entrez un terme de recherche pour trouver des entreprises
                  </p>
                </div>
              )}

              {(query || category || city) && (
                <Link
                  href="/recherche"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ✕ Réinitialiser
                </Link>
              )}
            </div>

            {/* Results List */}
            {businesses.length > 0 ? (
              <div className="space-y-4">
                {businesses.map((biz) => {
                  const hasContact = biz.phone || biz.website

                  return (
                    <Link
                      key={biz.id}
                      href={`/entreprise/${biz.slug}`}
                      className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {biz.name}
                            </h3>
                            <p className="text-gray-600 mt-1 flex items-center gap-2">
                              <span>📍</span>
                              {biz.city}
                            </p>
                            {biz.description && (
                              <p className="text-gray-500 mt-2 text-sm line-clamp-2">
                                {biz.description}
                              </p>
                            )}

                            {/* Contact badges */}
                            {hasContact && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {biz.phone && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                    📞 Téléphone
                                  </span>
                                )}
                                {biz.website && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                    🌐 Site web
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Rating */}
                          {biz.google_rating && (
                            <div className="flex flex-col items-end shrink-0">
                              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
                                <span className="text-yellow-500 text-lg">★</span>
                                <span className="font-bold text-gray-900">
                                  {biz.google_rating}
                                </span>
                              </div>
                              {biz.google_reviews_count && (
                                <span className="text-xs text-gray-500 mt-1">
                                  {biz.google_reviews_count} avis
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : query || category || city ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-500 mb-6">
                  Essayez avec d&apos;autres termes de recherche
                </p>
                <Link
                  href="/recherche"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Nouvelle recherche
                </Link>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Trouvez l&apos;entreprise parfaite
                </h3>
                <p className="text-gray-500">
                  Utilisez le formulaire ci-dessus pour rechercher parmi plus de 600 000 entreprises
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={`/recherche?q=${query}&page=${page - 1}${category ? `&categorie=${category}` : ''}${city ? `&ville=${city}` : ''}`}
                    className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 font-medium text-gray-700 border border-gray-200"
                  >
                    ← Précédent
                  </Link>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Link
                        key={pageNum}
                        href={`/recherche?q=${query}&page=${pageNum}${category ? `&categorie=${category}` : ''}${city ? `&ville=${city}` : ''}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    )
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-gray-400">...</span>
                      <Link
                        href={`/recherche?q=${query}&page=${totalPages}${category ? `&categorie=${category}` : ''}${city ? `&ville=${city}` : ''}`}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 font-medium"
                      >
                        {totalPages}
                      </Link>
                    </>
                  )}
                </div>

                {page < totalPages && (
                  <Link
                    href={`/recherche?q=${query}&page=${page + 1}${category ? `&categorie=${category}` : ''}${city ? `&ville=${city}` : ''}`}
                    className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 font-medium text-gray-700 border border-gray-200"
                  >
                    Suivant →
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
