import type { MetadataRoute } from 'next'
import { ARTICLES } from '@/lib/articles'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://registreduquebec.com'
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    ...ARTICLES.map((a) => ({
      url: `${base}/blogue/${a.slug}`,
      lastModified: a.date,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
