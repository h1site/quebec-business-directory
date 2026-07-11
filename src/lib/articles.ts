import fs from 'fs'
import path from 'path'
import { marked } from 'marked'

export interface ArticleMeta {
  slug: string
  title: string
  excerpt: string
  date: string // ISO (publié)
}

// Ordre = ordre d'affichage sur la page d'accueil.
export const ARTICLES: ArticleMeta[] = [
  {
    slug: 'financer-startup-reprise-entreprise-quebec-2026',
    title: "Comment financer sa startup ou sa reprise d'entreprise au Québec en 2026",
    excerpt:
      "Subventions, prêts BDC et Investissement Québec, capital de risque, crédits d'impôt : le guide complet pour financer une startup ou une reprise au Québec.",
    date: '2026-07-11',
  },
  {
    slug: 'femmes-entrepreneures-repreneuriat-quebec-2026',
    title: 'Femmes entrepreneures au Québec : le repreneuriat en 2026',
    excerpt:
      'Le repreneuriat, une voie de croissance majeure pour les femmes entrepreneures du Québec : financement, organismes de soutien et parcours concrets.',
    date: '2026-07-11',
  },
  {
    slug: 'defis-pme-quebecoises-2026-inflation-geopolitique',
    title: 'Les défis des PME québécoises en 2026 : inflation, géopolitique, attentes clients',
    excerpt:
      "Inflation, tensions géopolitiques, pénurie de main-d'œuvre, virage IA : les grands défis des PME québécoises en 2026 et des pistes d'action réalistes.",
    date: '2026-07-11',
  },
]

const CONTENT_DIR = path.join(process.cwd(), 'src/content')

export function getArticleMeta(slug: string): ArticleMeta | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

export function getArticle(slug: string) {
  const meta = getArticleMeta(slug)
  if (!meta) return null
  const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), 'utf8')
  const body = raw.replace(/^#\s+.*(\r?\n)+/, '') // retire le H1 (rendu séparément)
  const html = marked.parse(body, { async: false }) as string
  const words = body.trim().split(/\s+/).filter(Boolean).length
  const readingMinutes = Math.max(1, Math.round(words / 200))
  return { ...meta, html, readingMinutes }
}
