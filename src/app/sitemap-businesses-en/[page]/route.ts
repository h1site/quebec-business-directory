import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 86400 // 24 hours

const PAGE_SIZE = 1000
const INDEXABLE_EN_BUSINESS_FILTER =
  'and(verification_confidence.eq.high,ai_description_en.not.is.null),' +
  'and(is_claimed.eq.true,ai_description_en.not.is.null)'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page: pageParam } = await params
  const page = parseInt(pageParam, 10)

  if (isNaN(page) || page < 1) {
    return new NextResponse('Invalid page', { status: 400 })
  }

  const baseUrl = 'https://registreduquebec.com'
  const today = new Date().toISOString().split('T')[0]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse('Missing Supabase config', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const offset = (page - 1) * PAGE_SIZE

  const { data, error } = await supabase
    .from('businesses')
    .select('slug, updated_at, ai_enriched_at')
    .not('slug', 'is', null)
    .or(INDEXABLE_EN_BUSINESS_FILTER)
    .order('slug')
    .range(offset, offset + PAGE_SIZE - 1)

  if (error || !data) {
    return new NextResponse('Error fetching businesses', { status: 500 })
  }

  const urls = data.map((business) => {
    const lastmod = business.ai_enriched_at?.split('T')[0] || business.updated_at?.split('T')[0] || today

    return `  <url>
    <loc>${baseUrl}/en/company/${business.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/entreprise/${business.slug}" />
    <xhtml:link rel="alternate" hreflang="fr-CA" href="${baseUrl}/entreprise/${business.slug}" />
    <xhtml:link rel="alternate" hreflang="en-CA" href="${baseUrl}/en/company/${business.slug}" />
  </url>`
  })

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
