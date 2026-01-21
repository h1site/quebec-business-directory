import { createServiceClient } from '@/lib/supabase/server'
import trafficSlugs from '@/data/traffic-slugs.json'

// Set of valid slugs (with traffic) for fast lookup
const trafficSlugSet = new Set(trafficSlugs.slugs)

export interface Business {
  id: string
  name: string
  slug: string
  city: string | null
  main_category_slug: string | null
  google_rating: number | null
  google_reviews_count: number | null
  description: string | null
  ai_description: string | null
  phone: string | null
  website: string | null
}

export interface SearchResult {
  businesses: Business[]
  total: number
  noQuery?: boolean
}

// Check if a business should be visible (has website OR has traffic)
export function isValidBusiness(business: { slug: string; website: string | null }): boolean {
  return !!business.website || trafficSlugSet.has(business.slug)
}

// Normalize text for better matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, ' ')    // Replace special chars with space
    .replace(/\s+/g, ' ')            // Collapse multiple spaces
    .trim()
}

// Build search terms for PostgreSQL
function buildSearchTerms(query: string): string {
  const normalized = normalizeText(query)
  const words = normalized.split(' ').filter(w => w.length > 1)

  if (words.length === 0) return ''

  // Use prefix matching for partial word support
  return words.map(w => `${w}:*`).join(' & ')
}

export async function searchBusinesses(
  query: string,
  page: number,
  category?: string,
  city?: string
): Promise<SearchResult> {
  const supabase = createServiceClient()
  const limit = 20
  const offset = (page - 1) * limit

  // If no filters at all, return empty state
  if (!query && !category && !city) {
    return { businesses: [], total: 0, noQuery: true }
  }

  const cleanQuery = query?.trim() || ''

  // Build the base query - ONLY businesses with website OR in traffic list
  // We use a raw SQL approach for better performance with OR conditions on slugs

  let queryBuilder = supabase
    .from('businesses')
    .select(
      'id, name, slug, city, main_category_slug, google_rating, google_reviews_count, description, ai_description, phone, website',
      { count: 'estimated' }
    )
    .not('slug', 'is', null)

  // Apply category filter
  if (category) {
    queryBuilder = queryBuilder.eq('main_category_slug', category)
  }

  // Apply city filter with flexible matching
  if (city) {
    const cityNormalized = normalizeText(city)
    queryBuilder = queryBuilder.ilike('city', `%${cityNormalized}%`)
  }

  // Apply search query
  if (cleanQuery) {
    const searchTerms = buildSearchTerms(cleanQuery)

    if (searchTerms) {
      // Use full-text search with prefix matching
      queryBuilder = queryBuilder.textSearch('search_vector', searchTerms, {
        type: 'plain',
        config: 'french'
      })
    }
  }

  // Order by: enriched first, then rating, then reviews
  const { data, count, error } = await queryBuilder
    .order('ai_description', { ascending: false, nullsFirst: false })
    .order('google_rating', { ascending: false, nullsFirst: false })
    .order('google_reviews_count', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit * 3 - 1) // Fetch 3x to account for filtering

  if (error) {
    console.error('Search error:', error)

    // Fallback: try ILIKE search if full-text fails
    if (cleanQuery) {
      return fallbackSearch(cleanQuery, page, category, city)
    }
    return { businesses: [], total: 0 }
  }

  // Filter to only valid businesses (with website OR traffic)
  const validBusinesses = (data || []).filter(isValidBusiness)

  // Take only the page we need
  const pageBusinesses = validBusinesses.slice(0, limit)

  // Estimate total (rough since we're filtering client-side)
  const estimatedTotal = count ? Math.floor(count * (validBusinesses.length / Math.max(data?.length || 1, 1))) : validBusinesses.length

  return {
    businesses: pageBusinesses,
    total: estimatedTotal
  }
}

// Fallback search using ILIKE for when full-text search fails
async function fallbackSearch(
  query: string,
  page: number,
  category?: string,
  city?: string
): Promise<SearchResult> {
  const supabase = createServiceClient()
  const limit = 20
  const offset = (page - 1) * limit

  const cleanQuery = normalizeText(query)

  let queryBuilder = supabase
    .from('businesses')
    .select(
      'id, name, slug, city, main_category_slug, google_rating, google_reviews_count, description, ai_description, phone, website',
      { count: 'estimated' }
    )
    .not('slug', 'is', null)
    .or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,ai_description.ilike.%${cleanQuery}%`)

  if (category) {
    queryBuilder = queryBuilder.eq('main_category_slug', category)
  }

  if (city) {
    const cityNormalized = normalizeText(city)
    queryBuilder = queryBuilder.ilike('city', `%${cityNormalized}%`)
  }

  const { data, count, error } = await queryBuilder
    .order('ai_description', { ascending: false, nullsFirst: false })
    .order('google_rating', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit * 3 - 1)

  if (error) {
    console.error('Fallback search error:', error)
    return { businesses: [], total: 0 }
  }

  // Filter to only valid businesses
  const validBusinesses = (data || []).filter(isValidBusiness)
  const pageBusinesses = validBusinesses.slice(0, limit)
  const estimatedTotal = count ? Math.floor(count * (validBusinesses.length / Math.max(data?.length || 1, 1))) : validBusinesses.length

  return {
    businesses: pageBusinesses,
    total: estimatedTotal
  }
}

// Category type
export interface Category {
  id: string
  slug: string
  label_fr: string
  label_en: string
}

// Get categories for filter dropdown
export async function getCategories(lang: 'fr' | 'en' = 'fr'): Promise<Category[]> {
  const supabase = createServiceClient()
  const orderField = lang === 'fr' ? 'label_fr' : 'label_en'

  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_fr, label_en')
    .order(orderField)

  return data || []
}

// Quick search for autocomplete (returns top 5 matches)
export async function quickSearch(query: string): Promise<Business[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const supabase = createServiceClient()
  const cleanQuery = normalizeText(query)

  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, city, main_category_slug, google_rating, google_reviews_count, description, ai_description, phone, website')
    .not('slug', 'is', null)
    .ilike('name', `%${cleanQuery}%`)
    .order('google_rating', { ascending: false, nullsFirst: false })
    .limit(15)

  if (error) {
    console.error('Quick search error:', error)
    return []
  }

  // Filter to valid businesses and take top 5
  return (data || []).filter(isValidBusiness).slice(0, 5)
}
