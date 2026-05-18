import { NextRequest, NextResponse } from 'next/server'
import legacyRedirects from '@/data/legacy-redirects.json'

/**
 * Legacy URL handler — applies 301 redirects + 410 Gone for dead URLs.
 *
 * Built from `scripts/build-dead-pages-mapping.js`. The lookup is O(1) and
 * runs on the Edge before the page route resolves, so this is cheap even
 * with thousands of entries.
 *
 * Why 410 instead of letting the route return 404?
 *   - 410 ("Gone") tells Google "this URL will never come back, deindex it"
 *   - 404 keeps Google re-crawling for 6-18 months hoping it returns
 *   - 4973 dead URLs from the 649k→45k cleanup are dragging the site's quality
 *     signals; 410 lets Google clean them out of the index in 1-4 weeks
 */

const redirects = legacyRedirects.redirects as Record<string, string>
const goneSet = new Set(legacyRedirects.gone as string[])

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  const target = redirects[pathname]
  if (target) {
    const url = req.nextUrl.clone()
    url.pathname = target
    return NextResponse.redirect(url, 301)
  }

  if (goneSet.has(pathname)) {
    return new NextResponse('Gone', {
      status: 410,
      headers: { 'X-Robots-Tag': 'noindex' },
    })
  }

  return NextResponse.next()
}

export const config = {
  // Skip static assets, API routes, and Next internals
  matcher: ['/((?!_next/|api/|images/|video/|favicon|.*\\..*).*)'],
}
