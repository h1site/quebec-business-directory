'use client'

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

function StarRating({ rating }: { rating: number }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    const fill = rating >= i ? 1 : rating >= i - 0.5 ? 0.5 : 0
    stars.push(
      <svg key={i} className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id={`star-${i}-${rating}`}>
            <stop offset={`${fill * 100}%`} stopColor="currentColor" />
            <stop offset={`${fill * 100}%`} stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          fill={`url(#star-${i}-${rating})`}
          stroke="currentColor"
          strokeWidth={1}
        />
      </svg>
    )
  }
  return <div className="flex gap-0.5 mb-1">{stars}</div>
}

export default function FeaturedBusinessesSection({ businesses }: FeaturedBusinessesSectionProps) {
  if (!businesses || businesses.length === 0) return null

  return (
    <section className="py-10" style={{ background: 'var(--background-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Entreprises à découvrir
          </h2>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Des entreprises québécoises sélectionnées avec des informations détaillées
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/entreprise/${business.slug}`}
              className="block rounded-lg bg-slate-800/80 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 animate-fade-in-up"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-bold text-lg leading-tight line-clamp-2" style={{ color: 'var(--foreground)' }}>
                    {business.name}
                  </span>
                  {business.google_rating && (
                    <span className="inline-flex items-center gap-1 ml-2 flex-shrink-0 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-sm font-semibold">
                      <span>★</span>
                      {business.google_rating}
                    </span>
                  )}
                </div>

                {business.google_rating && (
                  <StarRating rating={business.google_rating} />
                )}

                {business.city && (
                  <div className="flex items-center gap-1 text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {business.city}
                  </div>
                )}

                {business.ai_description && (
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--foreground-muted)' }}>
                    {business.ai_description}
                  </p>
                )}

                <div className="mt-3 flex items-center text-sky-500 text-sm font-semibold">
                  Voir la fiche
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-semibold hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(14,165,233,0.25)] transition-all duration-200"
          >
            Voir toutes les entreprises
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
