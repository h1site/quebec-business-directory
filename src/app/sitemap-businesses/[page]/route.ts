import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 86400 // 24 hours

const PAGE_SIZE = 1000
const INDEXABLE_BUSINESS_FILTER =
  'and(verification_confidence.eq.high,website.not.is.null,ai_description.not.is.null,google_reviews_count.gte.100),' +
  'and(is_claimed.eq.true,ai_description.not.is.null)'

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
    .or(INDEXABLE_BUSINESS_FILTER)
    .order('google_reviews_count', { ascending: false, nullsFirst: false })
    .order('slug')
    .range(offset, offset + PAGE_SIZE - 1)

  if (error || !data) {
    return new NextResponse('Error fetching businesses', { status: 500 })
  }

  const urls = data.map((business) => {
    const lastmod = business.ai_enriched_at?.split('T')[0] || business.updated_at?.split('T')[0] || today

    return `  <url>
    <loc>${baseUrl}/entreprise/${business.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
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
