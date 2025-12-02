import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'
import { toEnglishSlug, getCategoryIcon } from '@/lib/category-slugs'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = createServiceClient()
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
  return { totalBusinesses: count || 600000 }
}

async function getCategories() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_en')
    .order('label_en')
  return data || []
}

const popularCities = [
  { name: 'Montreal', slug: 'montreal' },
  { name: 'Quebec City', slug: 'quebec' },
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

const quickSearches = [
  { icon: '🍔', label: 'Restaurants', query: 'restaurants' },
  { icon: '☕', label: 'Cafés', query: 'cafes' },
  { icon: '🔧', label: 'Plumbers', query: 'plumbers' },
  { icon: '✂️', label: 'Hair Salons', query: 'hair salon' },
]

export default async function HomePageEN() {
  const [stats, categories] = await Promise.all([
    getStats(),
    getCategories(),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Quebec Business Registry',
    url: 'https://registreduquebec.com/en',
    description: 'Easily find over 600,000 Quebec businesses.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://registreduquebec.com/en/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeaderEN />

      <main>
        {/* Hero Section - Yelp Style */}
        <section
          className="relative min-h-[500px] flex items-center justify-center bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80)',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-blue-600/80" />

          {/* Content */}
          <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
              Find the Best Businesses in Quebec
            </h1>

            {/* Beta Notice */}
            <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-6">
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-bold rounded-full uppercase tracking-wide">
                Beta
              </span>
              <p className="text-white/95 text-sm font-medium">
                Development version - Your feedback is welcome!
              </p>
            </div>

            <p className="text-xl text-white/95 font-medium mb-8">
              Over {stats.totalBusinesses.toLocaleString('en-CA')} Quebec businesses
            </p>

            {/* Search Form */}
            <form action="/en/search" method="GET" className="bg-white rounded-lg shadow-2xl overflow-hidden mb-6">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1 text-left">
                    What?
                  </label>
                  <input
                    type="text"
                    name="q"
                    placeholder="Restaurant, plumber, lawyer..."
                    className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
                  />
                </div>
                <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1 text-left">
                    Where?
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Montreal, Quebec City, Laval..."
                    className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 md:py-0 flex items-center justify-center transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Quick Search Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {quickSearches.map((item) => (
                <Link
                  key={item.query}
                  href={`/en/search?q=${encodeURIComponent(item.query)}`}
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-white/30 hover:border-white/50 transition-all hover:-translate-y-0.5"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Add Business CTA */}
            <div className="mt-8 p-5 bg-gray-900/80 border border-white/20 rounded-lg backdrop-blur-sm max-w-xl mx-auto">
              <p className="text-white text-sm mb-3 font-medium">
                Are you a business owner? Claim your listing for free!
              </p>
              <Link
                href="/en/register"
                className="inline-block px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg"
              >
                Create a free account
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
              Browse by Category
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const englishSlug = toEnglishSlug(category.slug)
                return (
                  <Link
                    key={category.id}
                    href={`/en/category/${englishSlug}`}
                    className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-md hover:-translate-y-1 transition-all"
                  >
                    <span className="text-3xl">
                      {getCategoryIcon(category.slug)}
                    </span>
                    <span className="font-semibold text-blue-900">
                      {category.label_en}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Popular Cities Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Popular Cities
              </h2>
              <p className="text-gray-600">
                Find businesses in Quebec&apos;s largest cities
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/en/city/${city.slug}`}
                  className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 p-4 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏙️</span>
                    <span className="font-medium text-gray-900">{city.name}</span>
                  </div>
                  <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">600,000+</div>
                <div className="text-blue-200">Businesses listed</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">17</div>
                <div className="text-blue-200">Quebec regions</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-blue-200">Free</div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              About the Quebec Business Registry
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              The Quebec Business Registry is the most comprehensive directory of
              Quebec businesses. Whether you&apos;re looking for a restaurant in Montreal, a
              plumber in Quebec City, or a notary in Laval, our directory helps you
              quickly find contact information for over 600,000 businesses.
            </p>
          </div>
        </section>
      </main>

      <FooterEN />
    </>
  )
}
