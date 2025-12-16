import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/dashboard',
          '/dashboard/*',
          '/tableau-de-bord',
          '/tableau-de-bord/*',
          '/en/dashboard',
          '/en/dashboard/*',
          '/connexion',
          '/inscription',
          '/en/login',
          '/en/register',
          '/mes-entreprises',
          '/entreprise/nouvelle',
          '/en/add-business',
          '/*/modifier',
          '/api/*',
        ],
      },
      {
        userAgent: 'AhrefsBot',
        disallow: '/',
      },
      {
        userAgent: 'SemrushBot',
        disallow: '/',
      },
      {
        userAgent: 'DotBot',
        disallow: '/',
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
    ],
    sitemap: [
      'https://registreduquebec.com/sitemap-reviews.xml',
      'https://registreduquebec.com/sitemap-enrichi.xml',
      'https://registreduquebec.com/sitemapindex.xml',
      'https://registreduquebec.com/sitemap-static.xml',
      'https://registreduquebec.com/sitemap-categories.xml',
      'https://registreduquebec.com/sitemap-cities.xml',
      'https://registreduquebec.com/sitemap-businesses-premium.xml',
      'https://registreduquebec.com/sitemap-businesses-1.xml',
      'https://registreduquebec.com/sitemap-businesses-2.xml',
      'https://registreduquebec.com/sitemap-businesses-3.xml',
      'https://registreduquebec.com/sitemap-businesses-4.xml',
      'https://registreduquebec.com/sitemap-businesses-5.xml',
    ],
  }
}
