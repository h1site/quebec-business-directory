import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PAGE_SIZE = 5000

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'
  const today = new Date().toISOString().split('T')[0]

  // Get total business count to determine number of sitemap pages
  let totalPages = 1
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { count } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .not('slug', 'is', null)

    if (count) {
      totalPages = Math.ceil(count / PAGE_SIZE)
    }
  }

  const sitemaps = [`  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`]

  for (let i = 1; i <= totalPages; i++) {
    sitemaps.push(`  <sitemap>
    <loc>${baseUrl}/sitemap-businesses/${i}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('\n')}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
