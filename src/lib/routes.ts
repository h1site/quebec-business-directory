// Slugs des articles valides — utilisé par le middleware (runtime edge, sans fs)
// pour rediriger toute URL inconnue vers la home. Garder en phase avec ARTICLES
// dans src/lib/articles.ts (mêmes slugs).
export const ARTICLE_SLUGS = [
  'financer-startup-reprise-entreprise-quebec-2026',
  'femmes-entrepreneures-repreneuriat-quebec-2026',
  'defis-pme-quebecoises-2026-inflation-geopolitique',
] as const
