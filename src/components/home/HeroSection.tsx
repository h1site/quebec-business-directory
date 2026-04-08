'use client'

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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-sky-900/80" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="mb-8 animate-fade-in">
          <span className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-sm font-medium">
            Bêta — Version en développement
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

        <form
          action="/recherche"
          method="GET"
          className="glass rounded-2xl overflow-hidden mb-8 animate-slide-up animation-delay-200"
        >
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/10">
              <label className="block text-sky-500 font-bold text-xs uppercase tracking-wider mb-1">
                Quoi?
              </label>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400/60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  name="q"
                  type="text"
                  placeholder="Restaurant, plombier, avocat..."
                  className="w-full bg-transparent text-white text-lg outline-none placeholder-slate-400/60"
                />
              </div>
            </div>
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/10">
              <label className="block text-sky-500 font-bold text-xs uppercase tracking-wider mb-1">
                Où?
              </label>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400/60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  name="ville"
                  type="text"
                  placeholder="Montréal, Québec, Laval..."
                  className="w-full bg-transparent text-white text-lg outline-none placeholder-slate-400/60"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-semibold text-base px-10 py-4 md:py-0 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden md:inline">Rechercher</span>
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-3 animate-slide-up animation-delay-300">
          {quickSearches.map((item) => (
            <Link
              key={item.query}
              href={`/recherche?q=${encodeURIComponent(item.query)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/15 bg-white/5 text-white font-medium text-sm hover:bg-white/10 hover:border-sky-500/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-12 glass rounded-2xl p-8 max-w-2xl mx-auto animate-slide-up animation-delay-400">
          <h3 className="text-white font-bold text-lg mb-3">Ajoutez votre entreprise gratuitement</h3>
          <p className="text-slate-300 text-sm mb-5">
            Créez votre fiche en quelques minutes et augmentez votre visibilité auprès de milliers de Québécois.
          </p>
          <Link
            href="/entreprise/nouvelle"
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2.5 rounded-md hover:-translate-y-0.5 transition-all duration-200 mb-6"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Ajouter mon entreprise
          </Link>
          <p className="text-slate-400 text-xs leading-relaxed">
            Vous voyez une entreprise qui vous appartient et qui n&apos;a pas été réclamée ? Rendez-vous sur sa fiche et faites une demande pour en prendre possession. Pour toute question, écrivez-nous à{' '}
            <a href="mailto:info@h1site.com" className="text-sky-400 hover:text-sky-300 underline">info@h1site.com</a>
          </p>
        </div>
      </div>
    </section>
  )
}
