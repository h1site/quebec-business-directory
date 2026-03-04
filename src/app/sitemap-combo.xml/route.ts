import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'
  const today = new Date().toISOString().split('T')[0]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse('Missing config', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data } = await supabase
    .from('businesses')
    .select('main_category_slug, city')
    .not('slug', 'is', null)
    .not('website', 'is', null)
    .not('main_category_slug', 'is', null)
    .not('city', 'is', null)

  if (!data) return new NextResponse('Error fetching data', { status: 500 })

  const combos = new Map<string, boolean>()
  for (const b of data) {
    if (b.main_category_slug && b.city) {
      const citySlug = toSlug(b.city)
      if (citySlug) {
        combos.set(`${b.main_category_slug}/${citySlug}`, true)
      }
    }
  }

  const urls = Array.from(combos.keys())
    .sort()
    .map(combo => `  <url>
    <loc>${baseUrl}/categorie/${combo}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
