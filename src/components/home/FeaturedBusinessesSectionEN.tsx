import Link from 'next/link'

interface Business {
  id: string
  name: string
  slug: string
  city: string | null
  google_rating: number | null
  google_reviews_count: number | null
  ai_description: string | null
  main_category_slug: string | null
}

interface FeaturedBusinessesSectionENProps {
  businesses: Business[]
}

export default function FeaturedBusinessesSectionEN({ businesses }: FeaturedBusinessesSectionENProps) {
  if (!businesses || businesses.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Featured Businesses
          </h2>
          <p className="text-gray-600">
            Hand-picked Quebec businesses with detailed information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/en/company/${business.slug}`}
              className="group bg-gray-50 hover:bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all animate-fade-in-up"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 text-lg">
                  {business.name}
                </h3>
                {business.google_rating && (
                  <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium shrink-0 ml-2">
                    <span>★</span>
                    {business.google_rating}
                  </span>
                )}
              </div>

              {business.city && (
                <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
                  <span>📍</span> {business.city}
                </p>
              )}

              {business.ai_description && (
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {business.ai_description}
                </p>
              )}

              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                View listing →
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/en/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            View all businesses
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
