import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { categorySlugsFrToEn } from '@/lib/category-slugs'

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

  // Premium businesses: 4.5+ rating with phone AND website
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, city, main_category_slug, updated_at')
    .not('phone', 'is', null)
    .not('website', 'is', null)
    .not('slug', 'is', null)
    .not('city', 'is', null)
    .gte('google_rating', 4.5)
    .order('google_rating', { ascending: false })
    .limit(10000)

  const urls: string[] = []

  for (const biz of businesses || []) {
    const citySlug = generateSlug(biz.city || '')
    const catSlug = biz.main_category_slug || 'entreprise'
    const enCatSlug = categorySlugsFrToEn[catSlug] || catSlug
    const lastMod = biz.updated_at ? new Date(biz.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

    urls.push(`  <url>
    <loc>${baseUrl}/${catSlug}/${citySlug}/${biz.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr-CA" href="${baseUrl}/${catSlug}/${citySlug}/${biz.slug}"/>
    <xhtml:link rel="alternate" hreflang="en-CA" href="${baseUrl}/en/${enCatSlug}/${citySlug}/${biz.slug}"/>
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
