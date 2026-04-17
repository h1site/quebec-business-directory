import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'
  const today = new Date().toISOString().split('T')[0]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const urls: string[] = []

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data } = await supabase
      .from('blog_articles')
      .select('slug, updated_at, published_at')
      .eq('is_published', true)

    if (data) {
      data.forEach(a => {
        const lastmod = (a.updated_at || a.published_at || today).split('T')[0]
        urls.push(`  <url>
    <loc>${baseUrl}/blogue/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr-CA" href="${baseUrl}/blogue/${a.slug}" />
    <xhtml:link rel="alternate" hreflang="en-CA" href="${baseUrl}/en/blog/${a.slug}" />
  </url>`)
      })
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
