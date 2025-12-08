import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'
  const today = new Date().toISOString().split('T')[0]

  const sitemaps = [
    'sitemap-enrichi.xml',
    'sitemap-static.xml',
    'sitemap-categories.xml',
    'sitemap-cities.xml',
    'sitemap-businesses-premium.xml',
    'sitemap-businesses-1.xml',
    'sitemap-businesses-2.xml',
    'sitemap-businesses-3.xml',
    'sitemap-businesses-4.xml',
    'sitemap-businesses-5.xml',
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${baseUrl}/${sitemap}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
