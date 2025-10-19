import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { sampleBusinesses } from '../data/sampleBusinesses.js';
import { quebecMunicipalities } from '../data/quebecMunicipalities.js';

const tableName = 'businesses';

const buildFilters = ({ query, city, region, mrc, category, phone, distance, coordinates, language, serviceMode, businessSize }) => {
  const filters = [];

  if (query) {
    filters.push({ column: 'search_vector', operator: 'fts', value: query });
  }

  if (city) {
    filters.push({ column: 'city', operator: 'ilike', value: `%${city}%` });
  }

  if (mrc) {
    // Filter by MRC name in the region field (which contains "MRC, Region")
    filters.push({ column: 'region', operator: 'ilike', value: `%${mrc}%` });
  } else if (region) {
    // Convert region slug to region name
    console.log('[buildFilters] Region slug from URL:', region);
    const regionData = quebecMunicipalities[region];
    console.log('[buildFilters] Region data found:', regionData);
    if (regionData) {
      console.log('[buildFilters] Filtering by region name:', regionData.name);
      // Search for region name in the region field (which contains "MRC, Region")
      filters.push({ column: 'region', operator: 'ilike', value: `%${regionData.name}%` });
    } else {
      console.warn('[buildFilters] No region data found for slug:', region);
    }
  }

  if (category) {
    filters.push({ column: 'categories', operator: 'cs', value: `{${category}}` });
  }

  if (phone) {
    filters.push({ column: 'phone', operator: 'ilike', value: `%${phone}%` });
  }

  if (distance && coordinates) {
    filters.push({
      column: 'location',
      operator: 'lte',
      value: `(${coordinates.longitude},${coordinates.latitude}),${distance}`
    });
  }

  // New filters for enriched view
  if (language) {
    filters.push({ column: 'languages', operator: 'cs', value: `{${language}}` });
  }

  if (serviceMode) {
    filters.push({ column: 'service_modes', operator: 'cs', value: `{${serviceMode}}` });
  }

  if (businessSize) {
    filters.push({ column: 'business_size_id', operator: 'eq', value: businessSize });
  }

  return filters;
};

export const searchBusinesses = async ({
  query,
  city,
  region,
  mrc,
  category,
  phone,
  distance,
  coordinates,
  language,
  serviceMode,
  businessSize,
  limit = 20
}) => {
  if (!isSupabaseConfigured) {
    const data = sampleBusinesses.filter((business) => {
      const matchesQuery = query
        ? [business.name, business.description, business.products_services]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query.toLowerCase()))
        : true;
      const matchesCity = city
        ? business.city.toLowerCase().includes(city.toLowerCase())
        : true;
      const matchesRegion = region
        ? business.region?.toLowerCase().includes(region.toLowerCase())
        : true;
      const matchesCategory = category
        ? business.categories?.some((cat) => cat.toLowerCase().includes(category.toLowerCase()))
        : true;
      const matchesPhone = phone
        ? business.phone?.replace(/\D/g, '').includes(phone.replace(/\D/g, ''))
        : true;
      return matchesQuery && matchesCity && matchesRegion && matchesCategory && matchesPhone;
    });
    return { data, error: null };
  }

  // Use businesses_enriched view to access languages, service_modes, etc.
  let request = supabase
    .from('businesses_enriched')
    .select(
      `id, slug, name, description, phone, email, address, city, categories, products_services, business_size_id,
       languages, service_modes, certifications, accessibility_features, payment_methods,
       primary_main_category_fr, primary_main_category_en, primary_sub_category_fr, primary_sub_category_en`
    )
    .limit(limit);

  const filters = buildFilters({ query, city, region, mrc, category, phone, distance, coordinates, language, serviceMode, businessSize });

  filters.forEach((filter) => {
    if (filter.operator === 'fts') {
      request = request.textSearch(filter.column, filter.value, {
        type: 'websearch',
        config: 'french'
      });
    } else if (filter.operator === 'cs') {
      request = request.contains(filter.column, filter.value);
    } else if (filter.operator === 'lte' && filter.column === 'location') {
      request = request.filter(filter.column, 'lt', filter.value);
    } else if (filter.operator === 'eq') {
      request = request.eq(filter.column, filter.value);
    } else {
      request = request.ilike(filter.column, filter.value);
    }
  });

  const { data, error } = await request.order('created_at', { ascending: false });

  // Flatten main_category data for easier access
  if (data && Array.isArray(data)) {
    data.forEach(business => {
      if (business.main_category) {
        business.main_category_slug = business.main_category.slug;
        business.main_category_name = business.main_category.label_fr;
      }
    });
  }

  return { data, error };
};

export const createBusiness = async (payload) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase n\'est pas configuré. Définissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
    );
  }

  const { data, error } = await supabase.from(tableName).insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data;
};

export const getBusinessById = async (id) => {
  if (!isSupabaseConfigured) {
    const business = sampleBusinesses.find((b) => b.id === id);
    return { data: business || null, error: business ? null : { message: 'Business not found' } };
  }

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

export const getBusinessBySlug = async (slug) => {
  if (!isSupabaseConfigured) {
    const business = sampleBusinesses.find((b) => b.slug === slug);
    return { data: business || null, error: business ? null : { message: 'Business not found' } };
  }

  // First, get business data with enriched view
  const { data, error } = await supabase
    .from('businesses_enriched')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return { data, error };
  }

  // Get category slugs by finding the primary category
  const { data: categoryData } = await supabase
    .from('business_categories')
    .select(`
      sub_categories:sub_category_id (
        slug,
        main_categories:main_category_id (
          slug
        )
      )
    `)
    .eq('business_id', data.id)
    .eq('is_primary', true)
    .single();

  // Add slugs to the business data
  if (categoryData?.sub_categories) {
    data.primary_sub_category_slug = categoryData.sub_categories.slug;
    if (categoryData.sub_categories.main_categories) {
      data.primary_main_category_slug = categoryData.sub_categories.main_categories.slug;
    }
  }

  return { data, error: null };
};

export const updateBusiness = async (id, payload) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase n\'est pas configuré. Définissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
    );
  }

  const { data, error } = await supabase
    .from(tableName)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getBusinessesByOwner = async (ownerId) => {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from(tableName)
    .select(`
      *,
      main_category:main_categories(slug, label_fr, label_en)
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  // Flatten main_category data for each business
  if (data) {
    data.forEach(business => {
      if (business.main_category) {
        business.main_category_slug = business.main_category.slug;
        business.main_category_name = business.main_category.label_fr;
      }
    });
  }

  return { data, error };
};

/**
 * Check if a slug is available (not already used by another business)
 * @param {string} slug - The slug to check
 * @param {string} currentBusinessId - ID of current business (to exclude from check)
 * @returns {Promise<{available: boolean, error: any}>}
 */
export const checkSlugAvailability = async (slug, currentBusinessId = null) => {
  if (!isSupabaseConfigured) {
    return { available: true, error: null };
  }

  try {
    let query = supabase
      .from(tableName)
      .select('id')
      .eq('slug', slug);

    // Exclude current business from check
    if (currentBusinessId) {
      query = query.neq('id', currentBusinessId);
    }

    const { data, error } = await query;

    if (error) {
      return { available: false, error };
    }

    // Slug is available if no results found
    return { available: data.length === 0, error: null };
  } catch (error) {
    return { available: false, error };
  }
};

/**
 * Delete a business by ID
 * Only the owner can delete their business
 */
export const deleteBusiness = async (id) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase n\'est pas configuré. Définissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
    );
  }

  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
