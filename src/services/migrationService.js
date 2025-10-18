import { supabase, isSupabaseConfigured } from './supabaseClient.js';

/**
 * Generate a slug from text
 */
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
};

/**
 * Update all businesses without slugs
 * @returns {Promise<Object>} - Result with success count and errors
 */
export const updateBusinessSlugs = async () => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase n\'est pas configuré');
  }

  try {
    // Get all businesses without slugs or with null slugs
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, name, slug')
      .or('slug.is.null,slug.eq.');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${businesses.length} businesses without slugs`);

    const results = {
      success: 0,
      errors: []
    };

    // Update each business with a generated slug
    for (const business of businesses) {
      const slug = generateSlug(business.name);

      if (!slug) {
        console.warn(`Cannot generate slug for business ${business.id} with name: ${business.name}`);
        results.errors.push({
          id: business.id,
          name: business.name,
          error: 'Cannot generate slug'
        });
        continue;
      }

      // Check if slug already exists (avoid duplicates)
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', slug)
        .neq('id', business.id)
        .single();

      let finalSlug = slug;

      // If slug exists, add a unique suffix
      if (existing) {
        finalSlug = `${slug}-${business.id.substring(0, 8)}`;
      }

      // Update the business
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ slug: finalSlug })
        .eq('id', business.id);

      if (updateError) {
        console.error(`Error updating business ${business.id}:`, updateError);
        results.errors.push({
          id: business.id,
          name: business.name,
          error: updateError.message
        });
      } else {
        console.log(`✓ Updated ${business.name} with slug: ${finalSlug}`);
        results.success++;
      }
    }

    return results;
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

/**
 * Fix a specific business slug by name
 * @param {string} businessName - The name of the business
 * @returns {Promise<Object>} - The updated business
 */
export const fixBusinessSlugByName = async (businessName) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase n\'est pas configuré');
  }

  try {
    // Find the business by name
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .ilike('name', businessName)
      .single();

    if (fetchError || !business) {
      throw new Error(`Business not found: ${businessName}`);
    }

    const slug = generateSlug(business.name);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .neq('id', business.id)
      .single();

    let finalSlug = slug;
    if (existing) {
      finalSlug = `${slug}-${business.id.substring(0, 8)}`;
    }

    // Update the business
    const { data: updated, error: updateError } = await supabase
      .from('businesses')
      .update({ slug: finalSlug })
      .eq('id', business.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log(`✓ Updated ${business.name} with slug: ${finalSlug}`);
    return updated;
  } catch (error) {
    console.error('Fix business error:', error);
    throw error;
  }
};
