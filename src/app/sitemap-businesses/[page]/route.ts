import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

const PAGE_SIZE = 5000

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
    .order('slug')
    .range(offset, offset + PAGE_SIZE - 1)

  if (error || !data) {
    return new NextResponse('Error fetching businesses', { status: 500 })
  }

  const urls = data.map((business) => {
    const lastmod = business.ai_enriched_at?.split('T')[0] || business.updated_at?.split('T')[0] || today
    const priority = business.ai_enriched_at ? '0.9' : '0.7'

    return `  <url>
    <loc>${baseUrl}/entreprise/${business.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
  })

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
