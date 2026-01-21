import { Metadata } from 'next'
import Link from 'next/link'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'
import { searchBusinesses, getCategories, type Business, type Category } from '@/lib/search'

export const metadata: Metadata = {
  title: 'Search for a Business in Quebec',
  description: 'Search among over 46,000 quality Quebec businesses. Find shops, services and professionals near you.',
}

interface SearchParams {
  q?: string
  page?: string
  category?: string
  city?: string
}

function BusinessCard({ business }: { business: Business }) {
  const hasContact = business.phone || business.website

  return (
    <Link
      href={`/en/company/${business.slug}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {business.name}
              </h3>
              {business.ai_description && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded-full">
                  Featured
                </span>
              )}
            </div>
            {business.city && (
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <span>📍</span>
                {business.city}
              </p>
            )}
            {(business.ai_description || business.description) && (
              <p className="text-gray-500 mt-2 text-sm line-clamp-2">
                {business.ai_description || business.description}
              </p>
            )}

            {hasContact && (
              <div className="flex flex-wrap gap-2 mt-3">
                {business.phone && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    📞 Phone
                  </span>
                )}
                {business.website && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    🌐 Website
                  </span>
                )}
              </div>
            )}
          </div>

          {business.google_rating && (
            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
                <span className="text-yellow-500 text-lg">★</span>
                <span className="font-bold text-gray-900">
                  {business.google_rating}
                </span>
              </div>
              {business.google_reviews_count && (
                <span className="text-xs text-gray-500 mt-1">
                  {business.google_reviews_count} reviews
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
    if (category) params.set('category', category)
    if (city) params.set('city', city)
    const qs = params.toString()
    return qs ? `/en/search?${qs}` : '/en/search'
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
          className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 font-medium text-gray-700 border border-gray-200"
        >
          ← Previous
        </Link>
      )}

      <div className="flex items-center gap-1">
        {startPage > 1 && (
          <>
            <Link
              href={buildUrl(1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 font-medium"
            >
              1
            </Link>
            {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
          </>
        )}

        {pages.map((pageNum) => (
          <Link
            key={pageNum}
            href={buildUrl(pageNum)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
              currentPage === pageNum
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {pageNum}
          </Link>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
            <Link
              href={buildUrl(totalPages)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 font-medium"
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 font-medium text-gray-700 border border-gray-200"
        >
          Next →
        </Link>
      )}
    </div>
  )
}

export default async function SearchPageEN({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const query = params.q || ''
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const category = params.category
  const city = params.city

  const [searchResult, categories] = await Promise.all([
    searchBusinesses(query, page, category, city),
    getCategories('en'),
  ])

  const { businesses, total } = searchResult
  const totalPages = Math.ceil(total / 20)
  const hasFilters = query || category || city

  return (
    <>
      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Search Header */}
        <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white py-12 overflow-hidden">
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
              Search for a Business
            </h1>
            <p className="text-blue-200 text-center mb-8">
              Over 46,000 quality Quebec businesses to discover
            </p>

            {/* Search Form */}
            <form action="/en/search" method="GET" className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
                    What?
                  </label>
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Restaurant, plumber, lawyer..."
                    className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
                    autoComplete="off"
                  />
                </div>
                <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
                    Where?
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={city || ''}
                    placeholder="Montreal, Quebec City, Laval..."
                    className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
                    autoComplete="off"
                  />
                </div>
                <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    defaultValue={category || ''}
                    className="w-full text-gray-900 outline-none text-base bg-transparent"
                  >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.label_en}
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
                  Search
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
              {hasFilters ? (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {total.toLocaleString('en-CA')} result{total !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {query && `for "${query}"`}
                    {city && ` in ${city}`}
                    {category && ` in ${categories.find(c => c.slug === category)?.label_en || category}`}
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Search for a business
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Enter a search term to find businesses
                  </p>
                </div>
              )}

              {hasFilters && (
                <Link
                  href="/en/search"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <span>✕</span> Reset
                </Link>
              )}
            </div>

            {/* Results List */}
            {businesses.length > 0 ? (
              <div className="space-y-4">
                {businesses.map((biz) => (
                  <BusinessCard key={biz.id} business={biz} />
                ))}
              </div>
            ) : hasFilters ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try with different search terms or fewer filters
                </p>
                <Link
                  href="/en/search"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  New search
                </Link>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Find the perfect business
                </h3>
                <p className="text-gray-500">
                  Use the form above to search among over 46,000 quality businesses
                </p>
              </div>
            )}

            {/* Pagination */}
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

      <FooterEN />
    </>
  )
}
