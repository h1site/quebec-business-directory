import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSlug } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse('Missing Supabase config', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get businesses with Google reviews, prioritized by review count and rating
  // Limit to 50,000 (sitemap limit) - prioritize businesses with most reviews
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('slug, city, main_category_slug, google_rating, google_reviews_count, updated_at')
    .not('google_rating', 'is', null)
    .gt('google_reviews_count', 0)
    .not('slug', 'is', null)
    .not('city', 'is', null)
    .order('google_reviews_count', { ascending: false })
    .limit(50000)

  if (error || !businesses) {
    return new NextResponse(`Error fetching businesses: ${error?.message}`, { status: 500 })
  }

  const urls = businesses.map((business) => {
    const citySlug = generateSlug(business.city || '')
    const categorySlug = business.main_category_slug || 'entreprise'
    const lastmod = business.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]

    // Higher priority for businesses with more reviews
    const reviewCount = business.google_reviews_count || 0
    let priority = 0.6
    if (reviewCount >= 100) priority = 0.9
    else if (reviewCount >= 50) priority = 0.85
    else if (reviewCount >= 20) priority = 0.8
    else if (reviewCount >= 10) priority = 0.75
    else if (reviewCount >= 5) priority = 0.7

    return `  <url>
    <loc>${baseUrl}/${categorySlug}/${citySlug}/${business.slug}</loc>
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
