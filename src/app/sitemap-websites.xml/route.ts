import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'
  const today = new Date().toISOString().split('T')[0]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse('Missing Supabase config', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get all businesses with website (prioritized for enrichment)
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('slug, updated_at, ai_description')
    .not('slug', 'is', null)
    .not('website', 'is', null)
    .neq('website', '')
    .order('ai_description', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .limit(50000)

  if (error || !businesses) {
    return new NextResponse('Error fetching businesses', { status: 500 })
  }

  const urls = businesses.map((business) => {
    const lastmod = business.updated_at?.split('T')[0] || today
    // Higher priority for enriched businesses
    const priority = business.ai_description ? '0.9' : '0.7'

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
