import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate SSR HTML content for business page (for Google crawlers)
function generateSSRContent(business, isEnglish = false) {
  const businessDescription = isEnglish ? business.description_en : business.description;
  const category = isEnglish
    ? (business.primary_main_category_en || business.categories?.[0] || '')
    : (business.primary_main_category_fr || business.categories?.[0] || '');

  // Translations
  const labels = isEnglish ? {
    phone: 'Phone',
    website: 'Website',
    email: 'Email',
    address: 'Address',
    neq: 'NEQ',
    about: 'About',
    reviews: 'Reviews',
    openingHours: 'Opening Hours'
  } : {
    phone: 'Téléphone',
    website: 'Site web',
    email: 'Courriel',
    address: 'Adresse',
    neq: 'NEQ',
    about: 'À propos',
    reviews: 'Avis',
    openingHours: 'Heures d\'ouverture'
  };

  // Build SSR HTML (semantic HTML for SEO)
  let html = `
  <article itemscope itemtype="https://schema.org/LocalBusiness" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
    <header style="margin-bottom: 2rem;">
      <h1 itemprop="name" style="font-size: 2.5rem; margin-bottom: 0.5rem; color: #1a202c;">${escapeHtml(business.name)}</h1>
      ${category ? `<p style="font-size: 1.1rem; color: #4a5568; margin-bottom: 0.5rem;">${escapeHtml(category)}</p>` : ''}
      ${business.city ? `<p itemprop="addressLocality" style="font-size: 1rem; color: #718096;">${escapeHtml(business.city)}, Québec</p>` : ''}
    </header>`;

  // Description
  if (businessDescription && businessDescription.length > 10) {
    html += `
    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: #2d3748;">${labels.about}</h2>
      <div itemprop="description" style="line-height: 1.6; color: #4a5568;">
        ${escapeHtml(businessDescription)}
      </div>
    </section>`;
  }

  // Contact Information
  html += `
    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: #2d3748;">Contact</h2>
      <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress" style="display: flex; flex-direction: column; gap: 0.75rem;">`;

  if (business.phone) {
    html += `
        <p style="margin: 0;">
          <strong>${labels.phone}:</strong>
          <a href="tel:${escapeHtml(business.phone)}" itemprop="telephone" style="color: #3182ce; text-decoration: none;">
            ${escapeHtml(business.phone)}
          </a>
        </p>`;
  }

  if (business.address) {
    const fullAddress = `${business.address}${business.city ? ', ' + business.city : ''}${business.postal_code ? ', ' + business.postal_code : ''}`;
    html += `
        <p style="margin: 0;" itemprop="streetAddress">
          <strong>${labels.address}:</strong> ${escapeHtml(fullAddress)}
        </p>`;
  }

  if (business.website) {
    html += `
        <p style="margin: 0;">
          <strong>${labels.website}:</strong>
          <a href="${escapeHtml(business.website)}" target="_blank" rel="noopener noreferrer" itemprop="url" style="color: #3182ce; text-decoration: none;">
            ${escapeHtml(business.website)}
          </a>
        </p>`;
  }

  if (business.email) {
    html += `
        <p style="margin: 0;">
          <strong>${labels.email}:</strong>
          <a href="mailto:${escapeHtml(business.email)}" itemprop="email" style="color: #3182ce; text-decoration: none;">
            ${escapeHtml(business.email)}
          </a>
        </p>`;
  }

  if (business.neq) {
    html += `
        <p style="margin: 0;">
          <strong>${labels.neq}:</strong> ${escapeHtml(business.neq)}
        </p>`;
  }

  html += `
      </div>
    </section>`;

  // Ratings (if available)
  if (business.google_rating && business.google_reviews_count) {
    html += `
    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: #2d3748;">${labels.reviews}</h2>
      <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating" style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 2rem; font-weight: bold; color: #f6ad55;">${business.google_rating}</span>
        <span style="color: #f6ad55;">★</span>
        <span style="color: #718096;">
          (<span itemprop="ratingValue">${business.google_rating}</span>/5 -
          <span itemprop="reviewCount">${business.google_reviews_count}</span> ${labels.reviews.toLowerCase()})
        </span>
      </div>
    </section>`;
  }

  html += `
  </article>`;

  return html;
}

async function testSSR() {
  console.log('🔍 Testing SSR HTML generation...\n');

  // Fetch a sample business
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', 'arpin-reinnovation-inc')
    .single();

  if (error || !business) {
    console.error('❌ Could not fetch business:', error);
    return;
  }

  console.log(`✅ Found business: ${business.name}\n`);
  console.log(`📝 Description FR: ${business.description?.substring(0, 100)}...`);
  console.log(`📝 Description EN: ${business.description_en?.substring(0, 100)}...\n`);

  // Generate SSR content
  const ssrHtml = generateSSRContent(business, false);

  console.log('🔨 Generated SSR HTML:\n');
  console.log(ssrHtml);
  console.log('\n✅ SSR HTML generation successful!');
  console.log(`📏 HTML length: ${ssrHtml.length} characters`);

  // Check if description is present
  if (business.description && ssrHtml.includes(business.description.substring(0, 50))) {
    console.log('✅ Description is present in SSR HTML');
  } else {
    console.log('⚠️  Description might not be present in SSR HTML');
  }
}

testSSR().catch(console.error);
