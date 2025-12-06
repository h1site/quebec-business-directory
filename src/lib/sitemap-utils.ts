import { createServiceClient } from '@/lib/supabase/server'
import { categorySlugsFrToEn } from '@/lib/category-slugs'

export function generateSlug(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getBusinessesSitemapXml(
  minRating: number,
  maxRating: number,
  limit: number = 10000,
  offset: number = 0
): Promise<string> {
  const baseUrl = 'https://registreduquebec.com'
  const supabase = createServiceClient()

  let query = supabase
    .from('businesses')
    .select('slug, city, main_category_slug, updated_at')
    .not('slug', 'is', null)
    .not('city', 'is', null)

  if (maxRating < 5) {
    query = query.gte('google_rating', minRating).lt('google_rating', maxRating)
  } else {
    query = query.gte('google_rating', minRating).lte('google_rating', maxRating)
  }

  const { data: businesses } = await query
    .order('google_rating', { ascending: false })
    .range(offset, offset + limit - 1)

  const urls: string[] = []

  for (const biz of businesses || []) {
    const citySlug = generateSlug(biz.city || '')
    const catSlug = biz.main_category_slug || 'entreprise'
    const enCatSlug = categorySlugsFrToEn[catSlug] || catSlug
    const lastMod = biz.updated_at ? new Date(biz.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

    urls.push(`  <url>
    <loc>${baseUrl}/${catSlug}/${citySlug}/${biz.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
}
