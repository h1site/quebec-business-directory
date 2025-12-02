export interface Business {
  id: string
  owner_id: string | null
  name: string
  description: string | null
  description_en: string | null
  mission_statement: string | null
  core_values: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  address_line2: string | null
  city: string | null
  region: string | null
  province: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  location: unknown | null
  products_services: string | null
  business_size_id: string | null
  established_year: number | null
  is_franchise: boolean
  slug: string
  seo_keywords: string[]
  seo_secondary_keywords: string[]
  seo_tags: string[]
  service_area: string | null
  service_radius_km: number | null
  rating_average: number
  rating_count: number
  categories: string[]
  notes_internal: string | null
  created_at: string
  updated_at: string
  search_vector: string | null
  logo_url: string | null
  gallery_images: string[] | null
  main_category_id: string | null
  show_email: boolean
  sub_category_ids: string[]
  language_ids: string[]
  service_mode_ids: string[]
  certification_ids: string[]
  accessibility_feature_ids: string[]
  payment_method_ids: string[]
  facebook_url: string | null
  instagram_url: string | null
  twitter_url: string | null
  threads_url: string | null
  tiktok_url: string | null
  google_rating: number | null
  google_reviews_count: number
  google_reviews: unknown[] | null
  linkedin_url: string | null
  mrc: string | null
  neq: string | null
  is_claimed: boolean
  claimed_at: string | null
  data_source: string | null
  scian_code: string | null
  scian_description: string | null
  auto_categorized: boolean
  etablissement_number: string | null
  google_types: string[] | null
  business_status: string | null
  google_place_id: string | null
  act_econ_code: string | null
  main_category_slug: string | null
  show_address: boolean
  opening_hours: Record<string, { open: string; close: string; closed?: boolean }> | null
  google_place_url: string | null
}

export interface Category {
  id: string
  slug: string
  label_fr: string
  label_en: string
  icon: string | null
}

export interface SubCategory {
  id: string
  slug: string
  label_fr: string
  label_en: string
  main_category_id: string
}
