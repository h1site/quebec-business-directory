import Link from 'next/link'

/**
 * Maillage interne vers le blog.
 *
 * Objectif SEO : donner aux articles de vraies « pages d'origine » depuis des
 * pages déjà indexées (fiches entreprises, catégories, villes…). Sans lien
 * interne, Google marque l'article « Explorée, actuellement non indexée » avec
 * « Aucune page d'origine détectée ». Ce bloc corrige exactement ça.
 *
 * LOT DE TEST : 3 articles. Si l'indexation décolle sur ceux-ci, on élargit à
 * l'ensemble (idéalement en piochant dynamiquement dans blog_articles).
 */
const TEST_ARTICLES = [
  {
    slug: 'financer-startup-reprise-entreprise-quebec-2026',
    title: 'Comment financer sa startup ou sa reprise d’entreprise au Québec en 2026',
    blurb: 'Subventions, capital-risque, crédits d’impôt : les options de financement.',
  },
  {
    slug: 'femmes-entrepreneures-repreneuriat-quebec-2026',
    title: 'Femmes entrepreneures au Québec : le repreneuriat en 2026',
    blurb: 'Le repreneuriat, une opportunité majeure de croissance entrepreneuriale.',
  },
  {
    slug: 'defis-pme-quebecoises-2026-inflation-geopolitique',
    title: 'Les défis des PME québécoises en 2026 : inflation, géopolitique, attentes clients',
    blurb: 'Comment les PME du Québec composent avec l’inflation et les tensions géopolitiques.',
  },
]

export default function BlogInternalLinks({ className = '' }: { className?: string }) {
  return (
    <section className={`rounded-xl p-6 border-2 border-[#020618] bg-transparent ${className}`}>
      <h2 className="text-xl font-bold mb-1" style={{ color: '#111827' }}>
        Guides pour entrepreneurs
      </h2>
      <p className="text-sm mb-4" style={{ color: '#4b5563' }}>
        Nos ressources pour créer, financer et reprendre une entreprise au Québec.
      </p>
      <ul className="space-y-3">
        {TEST_ARTICLES.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/blogue/${a.slug}`}
              className="font-semibold text-sky-600 hover:text-sky-500 underline underline-offset-2"
            >
              {a.title}
            </Link>
            <span className="block text-sm" style={{ color: '#4b5563' }}>{a.blurb}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/blogue"
        className="inline-block mt-4 text-sm text-sky-600 hover:text-sky-500 transition-colors"
      >
        Voir tous les guides &rarr;
      </Link>
    </section>
  )
}
