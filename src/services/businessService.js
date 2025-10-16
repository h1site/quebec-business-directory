import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { sampleBusinesses } from '../data/sampleBusinesses.js';

const tableName = 'businesses';

const buildFilters = ({ query, city, category, phone, distance, coordinates }) => {
  const filters = [];

  if (query) {
    filters.push({ column: 'search_vector', operator: 'fts', value: query });
  }

  if (city) {
    filters.push({ column: 'city', operator: 'ilike', value: `%${city}%` });
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

  return filters;
};

export const searchBusinesses = async ({
  query,
  city,
  category,
  phone,
  distance,
  coordinates,
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
      const matchesCategory = category
        ? business.categories?.some((cat) => cat.toLowerCase().includes(category.toLowerCase()))
        : true;
      const matchesPhone = phone
        ? business.phone?.replace(/\D/g, '').includes(phone.replace(/\D/g, ''))
        : true;
      return matchesQuery && matchesCity && matchesCategory && matchesPhone;
    });
    return { data, error: null };
  }

  let request = supabase
    .from(tableName)
    .select(
      `id, name, description, phone, email, address, city, categories, products_services`
    )
    .limit(limit);

  const filters = buildFilters({ query, city, category, phone, distance, coordinates });

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
    } else {
      request = request.ilike(filter.column, filter.value);
    }
  });

  const { data, error } = await request.order('created_at', { ascending: false });

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
