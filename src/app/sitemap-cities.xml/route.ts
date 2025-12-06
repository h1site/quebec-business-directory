import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function generateSlug(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'
  const supabase = createServiceClient()

  // Get all unique cities with business counts
  const { data: cities } = await supabase
    .from('businesses')
    .select('city')
    .not('city', 'is', null)
    .not('slug', 'is', null)

  // Count businesses per city and get unique cities
  const cityCount: Record<string, number> = {}
  for (const biz of cities || []) {
    if (biz.city) {
      cityCount[biz.city] = (cityCount[biz.city] || 0) + 1
    }
  }

  // Sort by business count and take top 500 cities
  const topCities = Object.entries(cityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 500)

  const urls: string[] = []

  for (const [cityName] of topCities) {
    const citySlug = generateSlug(cityName)
    if (!citySlug) continue

    urls.push(`  <url>
    <loc>${baseUrl}/ville/${citySlug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr-CA" href="${baseUrl}/ville/${citySlug}"/>
    <xhtml:link rel="alternate" hreflang="en-CA" href="${baseUrl}/en/city/${citySlug}"/>
  </url>`)

    urls.push(`  <url>
    <loc>${baseUrl}/en/city/${citySlug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr-CA" href="${baseUrl}/ville/${citySlug}"/>
    <xhtml:link rel="alternate" hreflang="en-CA" href="${baseUrl}/en/city/${citySlug}"/>
  </url>`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
