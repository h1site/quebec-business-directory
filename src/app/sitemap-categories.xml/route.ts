import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { categorySlugsFrToEn } from '@/lib/category-slugs'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'
  const supabase = createServiceClient()

  const { data: categories } = await supabase
    .from('main_categories')
    .select('slug')

  const urls: string[] = []

  for (const cat of categories || []) {
    const enSlug = categorySlugsFrToEn[cat.slug] || cat.slug

    urls.push(`  <url>
    <loc>${baseUrl}/categorie/${cat.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr-CA" href="${baseUrl}/categorie/${cat.slug}"/>
    <xhtml:link rel="alternate" hreflang="en-CA" href="${baseUrl}/en/category/${enSlug}"/>
  </url>`)

    urls.push(`  <url>
    <loc>${baseUrl}/en/category/${enSlug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr-CA" href="${baseUrl}/categorie/${cat.slug}"/>
    <xhtml:link rel="alternate" hreflang="en-CA" href="${baseUrl}/en/category/${enSlug}"/>
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
