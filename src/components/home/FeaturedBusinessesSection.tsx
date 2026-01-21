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

interface FeaturedBusinessesSectionProps {
  businesses: Business[]
}

export default function FeaturedBusinessesSection({ businesses }: FeaturedBusinessesSectionProps) {
  if (!businesses || businesses.length === 0) return null

  return (
    <section className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-3">
            Entreprises à découvrir
          </h2>
          <p className="text-slate-400">
            Des entreprises québécoises sélectionnées avec des informations détaillées
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/entreprise/${business.slug}`}
              className="group glass rounded-xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1 animate-fade-in-up"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-2 text-lg">
                  {business.name}
                </h3>
                {business.google_rating && (
                  <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg text-sm font-medium shrink-0 ml-2">
                    <span>★</span>
                    {business.google_rating}
                  </span>
                )}
              </div>

              {business.city && (
                <p className="text-slate-500 text-sm flex items-center gap-1.5 mb-3">
                  <span>📍</span> {business.city}
                </p>
              )}

              {business.ai_description && (
                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                  {business.ai_description}
                </p>
              )}

              <div className="mt-4 flex items-center text-sky-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Voir la fiche
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/25"
          >
            Voir toutes les entreprises
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
