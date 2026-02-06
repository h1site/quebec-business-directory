import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

type Business = { slug: string; updated_at: string | null; ai_enriched_at: string | null }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllBusinesses(supabase: any): Promise<Business[]> {
  const allBusinesses: Business[] = []
  const pageSize = 1000
  let page = 0

  while (true) {
    const { data, error } = await supabase
      .from('businesses')
      .select('slug, updated_at, ai_enriched_at')
      .not('slug', 'is', null)
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error || !data || data.length === 0) break
    allBusinesses.push(...data)
    if (data.length < pageSize) break
    page++
  }

  return allBusinesses
}

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'
  const today = new Date().toISOString().split('T')[0]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse('Missing Supabase config', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const allBusinesses = await fetchAllBusinesses(supabase)

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
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
