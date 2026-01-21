import Link from 'next/link'

interface HeroSectionProps {
  totalBusinesses: number
}

const quickSearches = [
  { icon: '🍔', label: 'Restaurants', query: 'restaurants' },
  { icon: '☕', label: 'Cafés', query: 'cafés' },
  { icon: '🔧', label: 'Plombiers', query: 'plombiers' },
  { icon: '✂️', label: 'Coiffure', query: 'salon de coiffure' },
]

export default function HeroSection({ totalBusinesses }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-950 bg-cover bg-center"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80)',
      }}
    >
      {/* Dark Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-sky-900/80" />
      {/* Animated orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-24 text-center">
        {/* Beta Badge */}
        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 mb-8 animate-fade-in">
          <span className="px-3 py-1 bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-900 text-xs font-bold rounded-full uppercase tracking-wide">
            Bêta
          </span>
          <span className="text-slate-300 text-sm">
            Version en développement
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 animate-slide-up">
          Trouvez les meilleures
          <span className="block gradient-text">entreprises du Québec</span>
        </h1>

        <p className="text-xl text-slate-300 mb-10 animate-slide-up animation-delay-100">
          Plus de{' '}
          <span className="font-bold text-sky-400">
            {totalBusinesses.toLocaleString('fr-CA')}
          </span>
          {' '}entreprises québécoises vérifiées
        </p>

        {/* Search Form - Glassmorphism Style */}
        <form
          action="/recherche"
          method="GET"
          className="glass rounded-2xl overflow-hidden mb-8 animate-slide-up animation-delay-200"
        >
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-white/10">
              <label className="block text-xs font-bold text-sky-400 uppercase tracking-wide mb-2 text-left">
                Quoi?
              </label>
              <input
                type="text"
                name="q"
                placeholder="Restaurant, plombier, avocat..."
                className="w-full bg-transparent text-white placeholder-slate-500 outline-none text-lg"
              />
            </div>
            <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-white/10">
              <label className="block text-xs font-bold text-sky-400 uppercase tracking-wide mb-2 text-left">
                Où?
              </label>
              <input
                type="text"
                name="ville"
                placeholder="Montréal, Québec, Laval..."
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
              <span className="hidden md:inline">Rechercher</span>
            </button>
          </div>
        </form>

        {/* Quick Search Buttons */}
        <div className="flex flex-wrap justify-center gap-3 animate-slide-up animation-delay-300">
          {quickSearches.map((item) => (
            <Link
              key={item.query}
              href={`/recherche?q=${encodeURIComponent(item.query)}`}
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
            Vous êtes propriétaire d&apos;une entreprise?
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          >
            <span>✨</span>
            Réclamez votre fiche gratuitement
          </Link>
        </div>
      </div>
    </section>
  )
}
