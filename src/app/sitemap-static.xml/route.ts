import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://registreduquebec.com'

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/en', priority: '1.0', changefreq: 'daily' },
    { url: '/recherche', priority: '0.9', changefreq: 'daily' },
    { url: '/en/search', priority: '0.9', changefreq: 'daily' },
    { url: '/a-propos', priority: '0.6', changefreq: 'monthly' },
    { url: '/en/about', priority: '0.6', changefreq: 'monthly' },
    { url: '/faq', priority: '0.6', changefreq: 'monthly' },
    { url: '/en/faq', priority: '0.6', changefreq: 'monthly' },
    { url: '/blogue', priority: '0.8', changefreq: 'weekly' },
    { url: '/en/blog', priority: '0.8', changefreq: 'weekly' },
    { url: '/parcourir/categories', priority: '0.8', changefreq: 'weekly' },
    { url: '/en/browse/categories', priority: '0.8', changefreq: 'weekly' },
    { url: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
    { url: '/politique-confidentialite', priority: '0.3', changefreq: 'yearly' },
    { url: '/en/legal-notice', priority: '0.3', changefreq: 'yearly' },
    { url: '/en/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
