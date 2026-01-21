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
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-900/30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-24 text-center">
        {/* Beta Badge */}
        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 mb-8 animate-fade-in">
          <span className="px-3 py-1 bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-900 text-xs font-bold rounded-full uppercase tracking-wide">
            Beta
          </span>
          <span className="text-slate-300 text-sm">
            Development version
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 animate-slide-up">
          Find the Best
          <span className="block gradient-text">Quebec Businesses</span>
        </h1>

        <p className="text-xl text-slate-300 mb-10 animate-slide-up animation-delay-100">
          Over{' '}
          <span className="font-bold text-sky-400">
            {totalBusinesses.toLocaleString('en-CA')}
          </span>
          {' '}verified Quebec businesses
        </p>

        {/* Search Form - Glassmorphism Style */}
        <form
          action="/en/search"
          method="GET"
          className="glass rounded-2xl overflow-hidden mb-8 animate-slide-up animation-delay-200"
        >
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-white/10">
              <label className="block text-xs font-bold text-sky-400 uppercase tracking-wide mb-2 text-left">
                What?
              </label>
              <input
                type="text"
                name="q"
                placeholder="Restaurant, plumber, lawyer..."
                className="w-full bg-transparent text-white placeholder-slate-500 outline-none text-lg"
              />
            </div>
            <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-white/10">
              <label className="block text-xs font-bold text-sky-400 uppercase tracking-wide mb-2 text-left">
                Where?
              </label>
              <input
                type="text"
                name="city"
                placeholder="Montreal, Quebec City, Laval..."
                className="w-full bg-transparent text-white placeholder-slate-500 outline-none text-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white px-10 py-5 md:py-0 flex items-center justify-center gap-2 font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span className="hidden md:inline">Search</span>
            </button>
          </div>
        </form>

        {/* Quick Search Buttons */}
        <div className="flex flex-wrap justify-center gap-3 animate-slide-up animation-delay-300">
          {quickSearches.map((item) => (
            <Link
              key={item.query}
              href={`/en/search?q=${encodeURIComponent(item.query)}`}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/50 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:-translate-y-0.5"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Add Business CTA */}
        <div className="mt-12 glass rounded-2xl p-6 max-w-xl mx-auto animate-slide-up animation-delay-400">
          <p className="text-slate-300 text-sm mb-4">
            Are you a business owner?
          </p>
          <Link
            href="/en/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          >
            <span>✨</span>
            Claim your listing for free
          </Link>
        </div>
      </div>
    </section>
  )
}
