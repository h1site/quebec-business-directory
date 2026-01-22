import { createServiceClient } from '@/lib/supabase/server'

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
  is_claimed: boolean
  owner_id: string | null
}

export interface SearchResult {
  businesses: Business[]
  total: number
}

// Check if a business should be visible
export function isValidBusiness(business: {
  slug: string
  website: string | null
  ai_description: string | null
  is_claimed?: boolean
  owner_id?: string | null
}): boolean {
  // User-claimed businesses are always visible
  if (business.is_claimed || business.owner_id) return true
  // Must be enriched AND have a website
  return !!business.ai_description && !!business.website
}

// Normalize text for matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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
  const cleanQuery = query?.trim() || ''

  // Query only valid businesses: claimed OR (enriched AND has website)
  let queryBuilder = supabase
    .from('businesses')
    .select(
      'id, name, slug, city, main_category_slug, google_rating, google_reviews_count, description, ai_description, phone, website, is_claimed, owner_id',
      { count: 'exact' }
    )
    .not('slug', 'is', null)
    // Only valid businesses: claimed OR owner OR (enriched AND has website)
    .or('is_claimed.eq.true,owner_id.not.is.null,and(ai_description.not.is.null,website.not.is.null)')

  // Apply filters
  if (category) {
    queryBuilder = queryBuilder.eq('main_category_slug', category)
  }

  if (city) {
    queryBuilder = queryBuilder.ilike('city', `%${normalizeText(city)}%`)
  }

  // Text search
  if (cleanQuery) {
    queryBuilder = queryBuilder.ilike('name', `%${normalizeText(cleanQuery)}%`)
  }

  const { data, count, error } = await queryBuilder
    .order('google_rating', { ascending: false, nullsFirst: false })
    .order('name')
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Search error:', error)
    return { businesses: [], total: 0 }
  }

  return {
    businesses: data || [],
    total: count || 0
  }
}

// Category type
export interface Category {
  id: string
  slug: string
  label_fr: string
  label_en: string
}

// Get categories (cached)
export async function getCategories(lang: 'fr' | 'en' = 'fr'): Promise<Category[]> {
  const supabase = createServiceClient()
  const orderField = lang === 'fr' ? 'label_fr' : 'label_en'

  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_fr, label_en')
    .order(orderField)

  return data || []
}

// Quick search for autocomplete
export async function quickSearch(query: string): Promise<Business[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const supabase = createServiceClient()
  const cleanQuery = normalizeText(query)

  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, city, main_category_slug, google_rating, google_reviews_count, description, ai_description, phone, website, is_claimed, owner_id')
    .not('slug', 'is', null)
    // Same filter as searchBusinesses for consistency
    .or('is_claimed.eq.true,owner_id.not.is.null,and(ai_description.not.is.null,website.not.is.null)')
    .ilike('name', `%${cleanQuery}%`)
    .order('google_rating', { ascending: false, nullsFirst: false })
    .limit(5)

  if (error) {
    console.error('Quick search error:', error)
    return []
  }

  return data || []
}
