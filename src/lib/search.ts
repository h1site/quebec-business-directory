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
  // Must be enriched
  return !!business.ai_description
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

  // Query only valid businesses
  let queryBuilder = supabase
    .from('businesses')
    .select(
      'id, name, slug, city, main_category_slug, google_rating, google_reviews_count, description, ai_description, phone, website, is_claimed, owner_id',
      { count: 'exact' }
    )
    .not('slug', 'is', null)
    .or('ai_description.not.is.null,is_claimed.eq.true')

  // Apply filters
  if (category) {
    queryBuilder = queryBuilder.eq('main_category_slug', category)
  }

  if (city) {
    queryBuilder = queryBuilder.ilike('city', `%${normalizeText(city)}%`)
  }

  // Text search — prioritize name, category, city over description
  if (cleanQuery) {
    const q = normalizeText(cleanQuery)

    // Map common search terms to category slugs
    const categoryMap: Record<string, string> = {
      'restaurant': 'restauration-et-alimentation',
      'restaurants': 'restauration-et-alimentation',
      'cafe': 'restauration-et-alimentation',
      'traiteur': 'restauration-et-alimentation',
      'boulangerie': 'restauration-et-alimentation',
      'epicerie': 'restauration-et-alimentation',
      'bar': 'restauration-et-alimentation',
      'pizza': 'restauration-et-alimentation',
      'sushi': 'restauration-et-alimentation',
      'plombier': 'construction-et-renovation',
      'plomberie': 'construction-et-renovation',
      'electricien': 'construction-et-renovation',
      'renovation': 'construction-et-renovation',
      'construction': 'construction-et-renovation',
      'toiture': 'construction-et-renovation',
      'peintre': 'construction-et-renovation',
      'dentiste': 'sante-et-bien-etre',
      'medecin': 'sante-et-bien-etre',
      'pharmacie': 'sante-et-bien-etre',
      'coiffure': 'sante-et-bien-etre',
      'coiffeur': 'sante-et-bien-etre',
      'esthetique': 'sante-et-bien-etre',
      'avocat': 'finance-assurance-et-juridique',
      'comptable': 'finance-assurance-et-juridique',
      'notaire': 'finance-assurance-et-juridique',
      'assurance': 'finance-assurance-et-juridique',
      'garage': 'automobile-et-transport',
      'mecanique': 'automobile-et-transport',
      'demenagement': 'automobile-et-transport',
      'taxi': 'automobile-et-transport',
      'hotel': 'tourisme-et-hebergement',
      'motel': 'tourisme-et-hebergement',
      'camping': 'tourisme-et-hebergement',
      'garderie': 'education-et-formation',
      'ecole': 'education-et-formation',
      'veterinaire': 'sante-et-bien-etre',
      'fleuriste': 'commerce-de-detail',
      'quincaillerie': 'commerce-de-detail',
      'meuble': 'commerce-de-detail',
      'informatique': 'technologie-et-informatique',
      'web': 'technologie-et-informatique',
    }

    const mappedCategory = categoryMap[q]

    if (mappedCategory) {
      // If query maps to a category, filter by category + name match
      queryBuilder = queryBuilder.or(
        `main_category_slug.eq.${mappedCategory},name.ilike.%${q}%`
      )
    } else {
      // General search: name, category slug, city
      queryBuilder = queryBuilder.or(
        `name.ilike.%${q}%,main_category_slug.ilike.%${q}%,city.ilike.%${q}%,products_services.ilike.%${q}%`
      )
    }
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
    .or('is_claimed.eq.true,owner_id.not.is.null,ai_description.not.is.null')
    .or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,ai_description.ilike.%${cleanQuery}%,main_category_slug.ilike.%${cleanQuery}%`)
    .order('google_rating', { ascending: false, nullsFirst: false })
    .limit(5)

  if (error) {
    console.error('Quick search error:', error)
    return []
  }

  return data || []
}
