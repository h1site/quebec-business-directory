export default function AboutSection() {
  return (
    <section className="py-20 bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="glass rounded-2xl p-10 animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-6">
            À propos du Registre du Québec
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
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
