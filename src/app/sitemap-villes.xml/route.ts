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
    .select('city')
    .not('slug', 'is', null)
    .eq('verification_confidence', 'high')
    .not('city', 'is', null)

  if (!data) return new NextResponse('Error fetching data', { status: 500 })

  const citySet = new Map<string, boolean>()
  for (const b of data) {
    if (b.city) {
      const slug = toSlug(b.city)
      if (slug) citySet.set(slug, true)
    }
  }

  const urls = Array.from(citySet.keys())
    .sort()
    .map(slug => `  <url>
    <loc>${baseUrl}/ville/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
