import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'
  const today = new Date().toISOString().split('T')[0]

  // « Redémarrage propre » : le sitemap n'expose plus que les pages piliers et le
  // blog. Les fiches/listings (businesses, categories, top, regions) sont sorties
  // de l'index (noindex via middleware) — inutile de les soumettre à Google.
  // Réversible : réajouter les <sitemap> ci-dessous restaure leur soumission.
  const sitemaps = [
    `  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`,
    `  <sitemap>
    <loc>${baseUrl}/sitemap-blog.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`,
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('\n')}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
