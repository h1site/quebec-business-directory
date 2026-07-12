import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ARTICLE_SLUGS } from '@/lib/routes'

// Pages réellement existantes sur le nouveau site.
const VALID = new Set<string>(['/', ...ARTICLE_SLUGS.map((s) => `/blogue/${s}`)])

/**
 * Redirige toute URL inconnue (ex. les ~7 000 anciennes fiches supprimées) vers
 * la home, en 301, plutôt que de renvoyer un 404. Améliore l'UX pour quiconque
 * arrive sur un vieux lien. (Note SEO : une redirection en masse vers la home
 * est vue comme un « soft 404 » par Google — sans gravité ici car ces URLs
 * n'étaient pas indexées.)
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (VALID.has(pathname)) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = '/'
  url.search = ''
  return NextResponse.redirect(url, 301)
}

export const config = {
  // Exclut _next, api, et tout fichier avec extension (assets, sitemap.xml,
  // robots.txt, ads.txt, favicon…). Le reste (pages) passe par le middleware.
  matcher: ['/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)'],
}
