import { NextRequest, NextResponse } from 'next/server'
import legacyRedirects from '@/data/legacy-redirects.json'

/**
 * Legacy URL handler — applies 301 redirects + 410 Gone for dead URLs,
 * and logs Googlebot / Bingbot hits to Supabase for crawl-behavior analysis.
 */

const redirects = legacyRedirects.redirects as Record<string, string>
const goneSet = new Set(legacyRedirects.gone as string[])

// --- Redémarrage propre (réversible) ---
// Trafic data-center / garbage (pollue GA, fait servir 0 pub AdSense = invalid
// traffic). Bloqué SAUF pour les bots reconnus (voir detectBot) → SEO préservé.
const BLOCKED_COUNTRIES = new Set(['SG', 'CN', 'IN'])

// Le site est plombé par ~7 000 fiches minces (scaled content). On le remet
// « comme neuf » : SEULES ces pages restent indexables ; tout le reste reçoit
// X-Robots-Tag:noindex (pages toujours en ligne pour les visiteurs). Réversible.
const INDEXABLE: RegExp[] = [
  /^\/$/,
  /^\/blogue(\/|$)/,
  /^\/a-propos$/,
  /^\/pourquoi-registre-du-quebec$/,
  /^\/histoire-pme-quebec$/,
  /^\/faq$/,
  /^\/contact$/,
  /^\/mentions-legales$/,
  /^\/politique-confidentialite$/,
  /^\/plan-du-site$/,
]

const BOT_PATTERNS: Array<[RegExp, string]> = [
  [/AdsBot-Google|Mediapartners-Google/i, 'adsbot'],
  [/Googlebot|Google-InspectionTool|Storebot-Google/i, 'googlebot'],
  [/Bingbot|Bing-Preview|MSNBot|adidxbot/i, 'bingbot'],
  [/DuckDuckBot/i, 'duckduckbot'],
  [/YandexBot/i, 'yandexbot'],
  [/Baiduspider/i, 'baidubot'],
  [/Applebot/i, 'applebot'],
  [/PerplexityBot|ChatGPT-User|GPTBot|OAI-SearchBot|ClaudeBot|anthropic-ai/i, 'ai-bot'],
]

function detectBot(ua: string): string | null {
  for (const [re, name] of BOT_PATTERNS) {
    if (re.test(ua)) return name
  }
  return null
}

function logBot(req: NextRequest, params: { path: string; status: number; action: string }) {
  const ua = req.headers.get('user-agent') || ''
  const bot = detectBot(ua)
  if (!bot) return

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) return

  // Fire-and-forget: don't await, don't block the response
  fetch(`${supabaseUrl}/rest/v1/bot_requests`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      bot,
      user_agent: ua.slice(0, 500),
      method: req.method,
      path: params.path,
      status: params.status,
      action: params.action,
      referer: req.headers.get('referer')?.slice(0, 500) || null,
      country: req.headers.get('x-vercel-ip-country') || null,
    }),
  }).catch(() => {})
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const bot = detectBot(req.headers.get('user-agent') || '')

  // Blocage géographique du garbage (jamais les bots reconnus → SEO safe)
  if (!bot) {
    const country = req.headers.get('x-vercel-ip-country') || ''
    if (BLOCKED_COUNTRIES.has(country)) {
      return new NextResponse('Not available in your region.', { status: 403 })
    }
  }

  const target = redirects[pathname]
  if (target) {
    logBot(req, { path: pathname, status: 301, action: 'redirect' })
    const url = req.nextUrl.clone()
    url.pathname = target
    return NextResponse.redirect(url, 301)
  }

  if (goneSet.has(pathname)) {
    logBot(req, { path: pathname, status: 410, action: 'gone' })
    return new NextResponse('Gone', {
      status: 410,
      headers: { 'X-Robots-Tag': 'noindex' },
    })
  }

  logBot(req, { path: pathname, status: 0, action: 'passthrough' })
  const res = NextResponse.next()
  // « Site neuf » : noindex tout ce qui n'est pas dans la liste blanche.
  if (!INDEXABLE.some((re) => re.test(pathname))) {
    res.headers.set('X-Robots-Tag', 'noindex, follow')
  }
  return res
}

export const config = {
  // Skip static assets, API routes, and Next internals
  matcher: ['/((?!_next/|api/|images/|video/|favicon|.*\\..*).*)'],
}
