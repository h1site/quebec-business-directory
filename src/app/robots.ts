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
    sitemap: 'https://registreduquebec.com/sitemap.xml',
  }
}
