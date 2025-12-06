import type { MetadataRoute } from 'next'

// This generates a sitemap index pointing to individual sitemaps
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://registreduquebec.com'

  // Return references to sub-sitemaps
  // Next.js will automatically create a sitemap index
  return [
    {
      url: `${baseUrl}/sitemap-static.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-categories.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-cities.xml`,
      lastModified: new Date(),
    },
    // Business sitemaps split by rating tier
    {
      url: `${baseUrl}/sitemap-businesses-premium.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-businesses-1.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-businesses-2.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-businesses-3.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-businesses-4.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-businesses-5.xml`,
      lastModified: new Date(),
    },
  ]
}
