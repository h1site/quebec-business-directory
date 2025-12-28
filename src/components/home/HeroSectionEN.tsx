import Link from 'next/link'

interface HeroSectionENProps {
  totalBusinesses: number
}

const quickSearches = [
  { icon: '🍔', label: 'Restaurants', query: 'restaurants' },
  { icon: '☕', label: 'Cafés', query: 'cafes' },
  { icon: '🔧', label: 'Plumbers', query: 'plumbers' },
  { icon: '✂️', label: 'Hair Salons', query: 'hair salon' },
]

export default function HeroSectionEN({ totalBusinesses }: HeroSectionENProps) {
  return (
    <section
      className="relative min-h-[500px] flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80)',
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-blue-600/80 animate-fade-in" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg animate-slide-up">
          Find the Best Businesses in Quebec
        </h1>

        {/* Beta Notice */}
        <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-6 animate-slide-up animation-delay-100">
          <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-bold rounded-full uppercase tracking-wide animate-pulse">
            Beta
          </span>
          <p className="text-white/95 text-sm font-medium">
            Development version - Your feedback is welcome!
          </p>
        </div>

        <p className="text-xl text-white/95 font-medium mb-8 animate-slide-up animation-delay-200">
          Over{' '}
          <span className="font-bold">
            {totalBusinesses.toLocaleString('en-CA')}
          </span>
          {' '}Quebec businesses
        </p>

        {/* Search Form */}
        <form
          action="/en/search"
          method="GET"
          className="bg-white rounded-lg shadow-2xl overflow-hidden mb-6 animate-slide-up animation-delay-300"
        >
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
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 md:py-0 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </form>

        {/* Quick Search Buttons */}
        <div className="flex flex-wrap justify-center gap-3 animate-slide-up animation-delay-400">
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
        <div className="mt-8 p-5 bg-gray-900/80 border border-white/20 rounded-lg backdrop-blur-sm max-w-xl mx-auto animate-slide-up animation-delay-500">
          <p className="text-white text-sm mb-3 font-medium">
            Are you a business owner? Claim your listing for free!
          </p>
          <Link
            href="/en/register"
            className="inline-block px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg hover:scale-105 active:scale-95"
          >
            Create a free account
          </Link>
        </div>
      </div>
    </section>
  )
}
