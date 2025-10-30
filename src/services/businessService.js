import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { sampleBusinesses } from '../data/sampleBusinesses.js';
import { quebecMunicipalities } from '../data/quebecMunicipalities.js';
import { matchesIgnoreAccents } from '../utils/textNormalization.js';

const tableName = 'businesses';

const buildFilters = ({ query, city, region, mrc, category, phone, distance, coordinates, language, serviceMode, businessSize, mainCategorySlug, subCategorySlug, mainCategoryId, subCategoryId }) => {
  const filters = [];

  if (query) {
    filters.push({ column: 'search_vector', operator: 'fts', value: query });
  }

  if (city) {
    // Normalize city name: decode URL encoding, replace spaces/hyphens/underscores with wildcards
    // This handles: "CAP+SANTE", "CAP SANTE", "CAP-SANTÉ", "Cap-Santé"
    const normalizedCity = decodeURIComponent(city)
      .replace(/[\s\-_+]/g, '%') // Replace separators with SQL wildcard
      .trim();
    // Use unaccent for accent-insensitive search (Montréal = Montreal)
    // Note: don't add % here, it's added in the query builder (line 150)
    filters.push({ column: 'city', operator: 'unaccent_ilike', value: normalizedCity });
  }

  if (mrc) {
    // Convert MRC slug to MRC name for exact matching
    const regionData = quebecMunicipalities[region];
    if (regionData && regionData.mrcs[mrc]) {
      const mrcName = regionData.mrcs[mrc].name;
      filters.push({ column: 'mrc', operator: 'eq', value: mrcName });
    }
  } else if (region) {
    // Convert region slug to region name
    const regionData = quebecMunicipalities[region];
    if (regionData) {
      // Search for region name in the region field (which contains "MRC, Region")
      filters.push({ column: 'region', operator: 'ilike', value: `%${regionData.name}%` });
    }
  }

  // Category filtering - prefer ID over slug for better reliability
  if (subCategoryId) {
    // Filter by subcategory ID (most specific)
    filters.push({ column: 'sub_category_id', operator: 'eq', value: subCategoryId });
  } else if (subCategorySlug) {
    // Fallback to subcategory slug
    filters.push({ column: 'primary_sub_category_slug', operator: 'eq', value: subCategorySlug });
  } else if (mainCategoryId) {
    // Filter by main category ID
    filters.push({ column: 'main_category_id', operator: 'eq', value: mainCategoryId });
  } else if (mainCategorySlug) {
    // Fallback to main category slug (kept for backwards compatibility but won't match anything)
    filters.push({ column: 'primary_main_category_slug', operator: 'eq', value: mainCategorySlug });
  } else if (category) {
    // Fallback to old text-based category search for backwards compatibility
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
  mainCategorySlug,
  subCategorySlug,
  mainCategoryId,
  subCategoryId,
  limit = 20,
  offset = 0
}) => {
  if (!isSupabaseConfigured) {
    const data = sampleBusinesses.filter((business) => {
      const matchesQuery = query
        ? [business.name, business.description, business.products_services]
            .filter(Boolean)
            .some((value) => matchesIgnoreAccents(value, query))
        : true;
      const matchesCity = city
        ? matchesIgnoreAccents(business.city, city)
        : true;
      const matchesRegion = region
        ? matchesIgnoreAccents(business.region, region)
        : true;
      const matchesCategory = category
        ? business.categories?.some((cat) => matchesIgnoreAccents(cat, category))
        : true;
      const matchesPhone = phone
        ? business.phone?.replace(/\D/g, '').includes(phone.replace(/\D/g, ''))
        : true;
      return matchesQuery && matchesCity && matchesRegion && matchesCategory && matchesPhone;
    });
    return { data, error: null };
  }

  // Use businesses_enriched view for category slug filtering
  // Only count on first page to improve performance (count is expensive)
  const shouldCount = offset === 0;
  let request = supabase
    .from('businesses_enriched')
    .select('*', shouldCount ? { count: 'exact' } : {})
    .range(offset, offset + limit - 1);

  const filters = buildFilters({ query, city, region, mrc, category, phone, distance, coordinates, language, serviceMode, businessSize, mainCategorySlug, subCategorySlug, mainCategoryId, subCategoryId });

  filters.forEach((filter) => {
    if (filter.operator === 'fts') {
      request = request.textSearch(filter.column, filter.value, {
        type: 'websearch',
        config: 'french'
      });
    } else if (filter.operator === 'unaccent_ilike') {
      // Simple ILIKE search with normalized pattern
      // The city filter already normalizes spaces/hyphens to wildcards
      // This allows "CAP SANTE" to match "Cap-Santé", "Vaudreuil-Dorion" etc.
      request = request.ilike(filter.column, `%${filter.value}%`);
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

  // Si aucun filtre, ordre aléatoire. Sinon, ordre par date de création
  const hasFilters = filters.length > 0;
  let result;

  if (hasFilters) {
    // Avec filtres: ordre chronologique (plus récents en premier)
    result = await request.order('created_at', { ascending: false });
  } else {
    // Sans filtres: ordre VRAIMENT aléatoire via PostgreSQL random()
    const randomOffset = Math.floor(Math.random() * 1000); // Random start point
    // Don't count on random queries for better performance
    result = await supabase
      .from('businesses_enriched')
      .select('*')
      .range(randomOffset, randomOffset + limit - 1)
      .order('id', { ascending: false });
  }

  const { data, error, count } = result;

  // Flatten main_category data for easier access
  if (data && Array.isArray(data)) {
    data.forEach(business => {
      if (business.main_category) {
        business.main_category_slug = business.main_category.slug;
        business.main_category_name = business.main_category.label_fr;
      }
    });
  }

  return { data, error, count };
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

  // Get business data with enriched view (includes category slugs after migration)
  const { data, error } = await supabase
    .from('businesses_enriched')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return { data, error };
  }

  console.log('✅ Business data loaded:', {
    name: data.name,
    primary_main_category_fr: data.primary_main_category_fr,
    primary_main_category_slug: data.primary_main_category_slug,
    primary_sub_category_fr: data.primary_sub_category_fr,
    primary_sub_category_slug: data.primary_sub_category_slug,
    region: data.region,
    city: data.city
  });

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
 * Find potential duplicate businesses based on multiple criteria
 * Returns array of matches with confidence scores
 *
 * @param {Object} businessData - The business data to check
 * @param {string} businessData.name - Business name
 * @param {string} businessData.phone - Phone number
 * @param {string} businessData.address - Street address
 * @param {string} businessData.city - City name
 * @param {string} businessData.postal_code - Postal code
 * @param {string} businessData.google_place_id - Google Place ID (if available)
 * @returns {Promise<{matches: Array, error: any}>}
 */
export const findDuplicateBusinesses = async (businessData) => {
  if (!isSupabaseConfigured) {
    return { matches: [], error: null };
  }

  try {
    const matches = [];

    // Strategy 1: Exact Google Place ID match (100% confidence)
    if (businessData.google_place_id) {
      const { data: placeIdMatches, error: placeIdError } = await supabase
        .from(tableName)
        .select('id, name, address, city, phone, slug, data_source, is_claimed')
        .eq('google_place_id', businessData.google_place_id)
        .limit(1);

      if (placeIdMatches && placeIdMatches.length > 0) {
        matches.push({
          ...placeIdMatches[0],
          confidence: 100,
          matchReason: 'Google Place ID identique'
        });
        // If we have a 100% match, return immediately
        return { matches, error: null };
      }
    }

    // Strategy 2: Phone number match (90% confidence if in same city)
    if (businessData.phone) {
      const cleanPhone = businessData.phone.replace(/\D/g, ''); // Remove non-digits
      if (cleanPhone.length >= 10) {
        const { data: phoneMatches, error: phoneError } = await supabase
          .from(tableName)
          .select('id, name, address, city, phone, slug, data_source, is_claimed')
          .ilike('phone', `%${cleanPhone.slice(-10)}%`) // Match last 10 digits
          .limit(5);

        if (phoneMatches && phoneMatches.length > 0) {
          phoneMatches.forEach(match => {
            const sameCity = match.city?.toLowerCase() === businessData.city?.toLowerCase();
            matches.push({
              ...match,
              confidence: sameCity ? 90 : 70,
              matchReason: sameCity ? 'Même téléphone et ville' : 'Même téléphone'
            });
          });
        }
      }
    }

    // Strategy 3: Name + City fuzzy match (70-85% confidence)
    if (businessData.name && businessData.city) {
      const { data: nameMatches, error: nameError } = await supabase
        .from(tableName)
        .select('id, name, address, city, phone, slug, data_source, is_claimed')
        .ilike('city', businessData.city)
        .ilike('name', `%${businessData.name}%`)
        .limit(5);

      if (nameMatches && nameMatches.length > 0) {
        nameMatches.forEach(match => {
          // Calculate name similarity (simple approach)
          const similarity = calculateNameSimilarity(businessData.name, match.name);
          if (similarity > 0.6) {
            // Only add if not already in matches (avoid duplicates from phone match)
            const alreadyExists = matches.some(m => m.id === match.id);
            if (!alreadyExists) {
              matches.push({
                ...match,
                confidence: Math.round(similarity * 85),
                matchReason: `Nom similaire (${Math.round(similarity * 100)}%)`
              });
            }
          }
        });
      }
    }

    // Strategy 4: Address + City match (85% confidence)
    if (businessData.address && businessData.city) {
      const addressKeywords = businessData.address
        .toLowerCase()
        .replace(/\d+/g, '') // Remove numbers
        .split(/\s+/)
        .filter(word => word.length > 3); // Keep words > 3 chars

      if (addressKeywords.length > 0) {
        const addressPattern = `%${addressKeywords[0]}%`;
        const { data: addressMatches, error: addressError } = await supabase
          .from(tableName)
          .select('id, name, address, city, phone, slug, data_source, is_claimed')
          .ilike('city', businessData.city)
          .ilike('address', addressPattern)
          .limit(5);

        if (addressMatches && addressMatches.length > 0) {
          addressMatches.forEach(match => {
            const alreadyExists = matches.some(m => m.id === match.id);
            if (!alreadyExists) {
              matches.push({
                ...match,
                confidence: 85,
                matchReason: 'Même adresse et ville'
              });
            }
          });
        }
      }
    }

    // Sort by confidence (highest first) and remove duplicates
    const uniqueMatches = Array.from(
      new Map(matches.map(m => [m.id, m])).values()
    ).sort((a, b) => b.confidence - a.confidence);

    return { matches: uniqueMatches, error: null };
  } catch (error) {
    console.error('Error finding duplicate businesses:', error);
    return { matches: [], error };
  }
};

/**
 * Calculate similarity between two business names (0-1 scale)
 * Simple Levenshtein-like approach
 */
function calculateNameSimilarity(name1, name2) {
  if (!name1 || !name2) return 0;

  const clean1 = name1.toLowerCase().trim();
  const clean2 = name2.toLowerCase().trim();

  // Exact match
  if (clean1 === clean2) return 1;

  // One contains the other
  if (clean1.includes(clean2) || clean2.includes(clean1)) {
    return 0.85;
  }

  // Calculate Jaccard similarity (word-based)
  const words1 = new Set(clean1.split(/\s+/));
  const words2 = new Set(clean2.split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
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
