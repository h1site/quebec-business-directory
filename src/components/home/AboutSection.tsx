'use client'

export default function AboutSection() {
  return (
    <section className="py-10" style={{ background: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div
          className="rounded-lg shadow-md p-6 md:p-10 animate-fade-in bg-slate-800/80"
        >
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            À propos du Registre du Québec
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            Le Registre des entreprises du Québec est l&apos;annuaire le plus complet des
            entreprises québécoises. Que vous cherchiez un restaurant à Montréal, un
            plombier à Québec, ou un notaire à Laval, notre répertoire vous permet de
            trouver rapidement les coordonnées et informations de plus de 46 000
            entreprises de qualité.
          </p>
        </div>
      </div>
    </section>
  )
}
