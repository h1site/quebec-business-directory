/**
 * Schema.org Markup Generator for Business Listings
 * Generates dynamic, SEO-optimized JSON-LD based on business data
 */

/**
 * Map main category to specific Schema.org @type
 */
const getCategoryType = (categorySlug) => {
  const typeMap = {
    'restauration-et-alimentation': 'Restaurant',
    'sante-et-bien-etre': 'MedicalBusiness',
    'services-professionnels': 'ProfessionalService',
    'immobilier': 'RealEstateAgent',
    'automobile-et-transport': 'AutoRepair',
    'construction-et-renovation': 'HomeAndConstructionBusiness',
    'commerce-de-detail': 'Store',
    'services-financiers': 'FinancialService',
    'education-et-formation': 'EducationalOrganization',
    'beaute-et-soins-personnels': 'BeautySalon',
    'tourisme-et-hebergement': 'LodgingBusiness',
    'technologie-et-numerique': 'Organization',
    'animaux-et-veterinaires': 'VeterinaryCare',
    'services-juridiques': 'Attorney',
    'evenements-et-divertissement': 'EventVenue',
    'maison-et-services-domestiques': 'LocalBusiness',
    'sports-et-loisirs': 'SportsActivityLocation',
    'soins-a-domicile': 'HomeAndConstructionBusiness',
    'services-funeraires': 'LocalBusiness'
  };

  return typeMap[categorySlug] || 'LocalBusiness';
};

/**
 * Generate opening hours specification from business hours
 */
const generateOpeningHours = (businessHours) => {
  if (!businessHours || businessHours.length === 0) return null;

  const dayMap = {
    'lundi': 'Monday',
    'mardi': 'Tuesday',
    'mercredi': 'Wednesday',
    'jeudi': 'Thursday',
    'vendredi': 'Friday',
    'samedi': 'Saturday',
    'dimanche': 'Sunday'
  };

  const specs = [];
  const groupedHours = {};

  // Group days with same hours
  businessHours.forEach(hour => {
    if (hour.is_closed) return;

    const key = `${hour.open_time}-${hour.close_time}`;
    if (!groupedHours[key]) {
      groupedHours[key] = [];
    }
    groupedHours[key].push(dayMap[hour.day_of_week]);
  });

  // Generate specs for each group
  Object.entries(groupedHours).forEach(([timeRange, days]) => {
    const [opens, closes] = timeRange.split('-');
    specs.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days,
      opens,
      closes
    });
  });

  return specs.length > 0 ? specs : null;
};

/**
 * Generate sameAs array from social media URLs
 */
const generateSameAs = (business) => {
  const urls = [];

  if (business.facebook_url) urls.push(business.facebook_url);
  if (business.instagram_url) urls.push(business.instagram_url);
  if (business.twitter_url) urls.push(business.twitter_url);
  if (business.linkedin_url) urls.push(business.linkedin_url);
  if (business.threads_url) urls.push(business.threads_url);
  if (business.tiktok_url) urls.push(business.tiktok_url);
  if (business.google_maps_url) urls.push(business.google_maps_url);

  return urls.length > 0 ? urls : undefined;
};

/**
 * Generate payment accepted array
 */
const generatePaymentAccepted = (paymentMethods) => {
  if (!paymentMethods || paymentMethods.length === 0) return undefined;

  // Map internal payment methods to schema.org accepted values
  const methodMap = {
    'cash': 'Cash',
    'debit': 'Debit Card',
    'credit': 'Credit Card',
    'visa': 'Visa',
    'mastercard': 'Mastercard',
    'amex': 'American Express',
    'interac': 'Debit Card',
    'paypal': 'PayPal',
    'crypto': 'Cryptocurrency'
  };

  return paymentMethods.map(method => methodMap[method] || method).filter(Boolean);
};

/**
 * Generate area served array
 */
const generateAreaServed = (business) => {
  const areas = [];

  if (business.city) areas.push(business.city);
  if (business.region) areas.push(business.region);
  if (business.service_area && typeof business.service_area === 'string') {
    // Parse service_area string (e.g., "Montréal, Laval, Longueuil")
    const serviceAreas = business.service_area.split(',').map(s => s.trim());
    serviceAreas.forEach(area => {
      if (area && !areas.includes(area)) {
        areas.push(area);
      }
    });
  }

  return areas.length > 0 ? areas : undefined;
};

/**
 * Generate main LocalBusiness schema
 */
export const generateBusinessSchema = (business, canonicalUrl, businessHours = null) => {
  const baseUrl = window.location.origin;
  const businessType = getCategoryType(business.main_category_slug);

  const schema = {
    '@context': 'https://schema.org',
    '@type': businessType,
    '@id': `${canonicalUrl}#business`,
    name: business.name,
    description: business.description,
    url: canonicalUrl,
    telephone: business.phone,
    email: business.show_email ? business.email : undefined,
    image: [
      business.logo_url,
      ...(business.gallery_images || [])
    ].filter(Boolean),
    logo: business.logo_url,
    sameAs: generateSameAs(business),
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.province || 'QC',
      postalCode: business.postal_code,
      addressCountry: 'CA'
    }
  };

  // Add optional fields
  if (business.established_year) {
    schema.foundingDate = business.established_year.toString();
  }

  if (business.latitude && business.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude
    };
    schema.hasMap = `https://maps.google.com/?q=${business.latitude},${business.longitude}`;
  }

  const areaServed = generateAreaServed(business);
  if (areaServed) {
    schema.areaServed = areaServed;
  }

  if (businessHours) {
    const openingHours = generateOpeningHours(businessHours);
    if (openingHours) {
      schema.openingHoursSpecification = openingHours;
    }
  }

  // Add aggregate rating if available
  if (business.google_rating && business.google_reviews_count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.google_rating,
      reviewCount: business.google_reviews_count,
      bestRating: '5',
      worstRating: '1'
    };
  }

  // Add reviews if available
  if (business.google_reviews && business.google_reviews.length > 0) {
    schema.review = business.google_reviews.slice(0, 5).map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author_name
      },
      datePublished: review.time ? new Date(review.time * 1000).toISOString().split('T')[0] : undefined,
      reviewBody: review.text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
        bestRating: '5'
      }
    })).filter(r => r.datePublished); // Only include reviews with valid dates
  }

  // Add potential actions
  schema.potentialAction = [];

  // Only add phone action if phone exists
  if (business.phone) {
    schema.potentialAction.push({
      '@type': 'CallAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `tel:${business.phone.replace(/\D/g, '')}`
      }
    });
  }

  if (business.website) {
    schema.potentialAction.push({
      '@type': 'ViewAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: business.website
      }
    });
  }

  // Category-specific enhancements
  if (businessType === 'Restaurant') {
    schema.servesCuisine = business.sub_category_names || undefined;
    schema.acceptsReservations = 'true';
  }

  if (businessType === 'ProfessionalService' && business.products_services) {
    schema.serviceType = business.products_services.split('\n').filter(Boolean);
  }

  // Remove undefined fields
  Object.keys(schema).forEach(key => {
    if (schema[key] === undefined) {
      delete schema[key];
    }
  });

  return schema;
};

/**
 * Generate BreadcrumbList schema
 */
export const generateBreadcrumbSchema = (business) => {
  const baseUrl = window.location.origin;

  // Protection contre les valeurs null/undefined
  const citySlug = business.city ? business.city.toLowerCase().replace(/\s+/g, '-') : 'quebec';
  const mainCategorySlug = business.main_category_slug || 'entreprises';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: business.main_category_name || 'Catégorie',
        item: `${baseUrl}/categorie/${mainCategorySlug}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: business.city || 'Québec',
        item: `${baseUrl}/${mainCategorySlug}/${citySlug}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: business.name,
        item: `${baseUrl}/${mainCategorySlug}/${citySlug}/${business.slug}`
      }
    ]
  };
};

/**
 * Generate Organization schema (for site-wide)
 */
export const generateOrganizationSchema = () => {
  const baseUrl = window.location.origin;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Registre d\'entreprise du Québec',
    url: baseUrl,
    logo: `${baseUrl}/images/logos/logo.webp`,
    sameAs: []
  };
};

/**
 * Generate WebSite schema with SearchAction
 */
export const generateWebSiteSchema = () => {
  const baseUrl = window.location.origin;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: baseUrl,
    name: 'Registre d\'entreprise du Québec',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/recherche?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
};
