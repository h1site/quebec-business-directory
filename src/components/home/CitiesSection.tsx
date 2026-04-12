'use client'

import Link from 'next/link'

const popularCities = [
  { name: 'Montréal', slug: 'montreal' },
  { name: 'Québec', slug: 'quebec' },
  { name: 'Laval', slug: 'laval' },
  { name: 'Gatineau', slug: 'gatineau' },
  { name: 'Longueuil', slug: 'longueuil' },
  { name: 'Sherbrooke', slug: 'sherbrooke' },
  { name: 'Saguenay', slug: 'saguenay' },
  { name: 'Lévis', slug: 'levis' },
  { name: 'Trois-Rivières', slug: 'trois-rivieres' },
  { name: 'Terrebonne', slug: 'terrebonne' },
  { name: 'Saint-Jean-sur-Richelieu', slug: 'saint-jean-sur-richelieu' },
  { name: 'Repentigny', slug: 'repentigny' },
]

export default function CitiesSection() {
  return (
    <section className="py-[100px] bg-[#d5d9df]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6 animate-fade-in">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">
            Découvrir des entreprises dans votre région
          </h2>
          <p className="text-gray-600">
            Parcourez les entreprises par ville au Québec
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularCities.map((city) => (
            <Link
              key={city.slug}
              href={`/ville/${city.slug}`}
              className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 animate-fade-in-up no-underline"
            >
              <div className="flex items-center gap-3">
                
                <span className="font-medium text-gray-900">{city.name}</span>
              </div>
              <svg className="w-5 h-5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
