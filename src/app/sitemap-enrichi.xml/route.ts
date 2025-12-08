import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'

  const supabase = createServiceClient()

  // Get all businesses with AI enrichment
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('slug, city, main_category_slug, ai_enriched_at, updated_at')
    .not('ai_enriched_at', 'is', null)
    .not('slug', 'is', null)
    .not('city', 'is', null)
    .order('ai_enriched_at', { ascending: false })

  if (error || !businesses) {
    return new NextResponse('Error fetching businesses', { status: 500 })
  }

  const urls = businesses.map((business) => {
    const citySlug = generateSlug(business.city || '')
    const categorySlug = business.main_category_slug || 'entreprise'
    const lastmod = business.ai_enriched_at?.split('T')[0] || new Date().toISOString().split('T')[0]

    return `  <url>
    <loc>${baseUrl}/${categorySlug}/${citySlug}/${business.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
