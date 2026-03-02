import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const BATCH_SIZE = 1000

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'
  const today = new Date().toISOString().split('T')[0]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse('Missing Supabase config', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Fetch all businesses by paginating through batches
  const allBusinesses: { slug: string; updated_at: string | null; ai_enriched_at: string | null }[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('businesses')
      .select('slug, updated_at, ai_enriched_at')
      .not('slug', 'is', null)
      .order('slug')
      .range(offset, offset + BATCH_SIZE - 1)

    if (error || !data) {
      return new NextResponse(`Error fetching businesses at offset ${offset}`, { status: 500 })
    }

    allBusinesses.push(...data)
    offset += BATCH_SIZE
    hasMore = data.length === BATCH_SIZE
  }

  // Build all URL entries
  const urls = allBusinesses.map((business) => {
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
