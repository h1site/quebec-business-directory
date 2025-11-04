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
export const generateBusinessSchema = (business, canonicalUrl, businessHours = null, isEnglish = false) => {
  const baseUrl = window.location.origin;
  const businessType = getCategoryType(business.main_category_slug);

  // Use language-appropriate description
  const description = isEnglish
    ? (business.description_en || business.description)
    : (business.description || business.description_en);

  const schema = {
    '@context': 'https://schema.org',
    '@type': businessType,
    '@id': `${canonicalUrl}#business`,
    name: business.name,
    description: description,
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
 * Can accept either a business object or an array of breadcrumb items
 */
export const generateBreadcrumbSchema = (businessOrItems) => {
  const baseUrl = window.location.origin;

  // If it's an array, it's items from Breadcrumb component
  if (Array.isArray(businessOrItems)) {
    const items = businessOrItems;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url ? `${baseUrl}${item.url}` : undefined
      })).filter(item => item.name && item.name !== 'undefined') // Filter out invalid items
    };
  }

  // Otherwise it's a business object
  const business = businessOrItems;

  // Protection contre les valeurs null/undefined
  const citySlug = business.city ? business.city.toLowerCase().replace(/\s+/g, '-') : null;
  const mainCategorySlug = business.main_category_slug || business.main_category?.slug;
  const businessSlug = business.slug;

  // Build items array, filtering out undefined elements
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: baseUrl
    }
  ];

  // Add category if available
  if (mainCategorySlug) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: business.main_category_name || business.main_category?.label_fr || 'Catégorie',
      item: `${baseUrl}/categorie/${mainCategorySlug}`
    });
  }

  // Add city if available
  if (business.city && citySlug) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: business.city,
      item: mainCategorySlug ? `${baseUrl}/${mainCategorySlug}/${citySlug}` : `${baseUrl}/recherche?city=${encodeURIComponent(business.city)}`
    });
  }

  // Add business name as final item
  if (business.name && businessSlug) {
    const businessUrl = mainCategorySlug && citySlug
      ? `${baseUrl}/${mainCategorySlug}/${citySlug}/${businessSlug}`
      : `${baseUrl}/entreprise/${businessSlug}`;

    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: business.name,
      item: businessUrl
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
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

/**
 * Generate FAQPage schema for business pages
 * @param {Object} business - Business object
 * @param {Array} businessHours - Business hours array
 * @param {boolean} isEnglish - Whether to use English translations
 * @returns {Object} FAQPage schema
 */
export const generateFAQSchema = (business, businessHours = null, isEnglish = false) => {
  if (!business) return null;

  const faqItems = [];

  // Question 1: City
  if (business.city) {
    const questionCity = isEnglish
      ? `In which city is ${business.name} located?`
      : `Dans quelle ville se situe ${business.name} ?`;
    const answerCity = isEnglish
      ? `${business.name} is located in ${business.city}${business.region ? `, ${business.region}` : ''}.`
      : `${business.name} se situe à ${business.city}${business.region ? `, ${business.region}` : ''}.`;

    faqItems.push({
      '@type': 'Question',
      name: questionCity,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerCity
      }
    });
  }

  // Question 2: Address
  if (business.address) {
    const questionAddress = isEnglish
      ? `What is the address of ${business.name}?`
      : `À quelle adresse se situe ${business.name} ?`;
    const answerAddress = `${business.address}${business.address_line2 ? `, ${business.address_line2}` : ''}, ${business.city}, ${business.province || 'QC'} ${business.postal_code || ''}`;

    faqItems.push({
      '@type': 'Question',
      name: questionAddress,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerAddress
      }
    });
  }

  // Question 3: Phone
  const questionPhone = isEnglish
    ? `Does ${business.name} have a phone number?`
    : `Est-ce que ${business.name} a un numéro de téléphone ?`;
  const answerPhone = business.phone
    ? (isEnglish
        ? `Yes, you can contact ${business.name} at ${business.phone}.`
        : `Oui, vous pouvez contacter ${business.name} au ${business.phone}.`)
    : (isEnglish
        ? `Phone information for ${business.name} is not available on this listing. We invite you to visit their website or go directly to their establishment.`
        : `Les informations de téléphone pour ${business.name} ne sont pas disponibles sur cette fiche. Nous vous invitons à visiter leur site web ou à vous rendre directement à leur établissement.`);

  faqItems.push({
    '@type': 'Question',
    name: questionPhone,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answerPhone
    }
  });

  // Question 4: Website
  const questionWebsite = isEnglish
    ? `Does ${business.name} have a website?`
    : `${business.name} a-t-il un site internet ?`;
  const answerWebsite = business.website
    ? (isEnglish
        ? `Yes, ${business.name} has a website. You can view it by clicking on the "Website" link in the contact information above.`
        : `Oui, ${business.name} a un site internet. Vous pouvez le consulter en cliquant sur le lien "Site web" dans les coordonnées ci-dessus.`)
    : (isEnglish
        ? `Website information for ${business.name} is not available on this listing. We invite you to contact them directly for more information.`
        : `Les informations de site internet pour ${business.name} ne sont pas disponibles sur cette fiche. Nous vous invitons à les contacter directement pour plus d'informations.`);

  faqItems.push({
    '@type': 'Question',
    name: questionWebsite,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answerWebsite
    }
  });

  // Question 5: Opening hours
  const questionHours = isEnglish
    ? `What are the opening hours of ${business.name}?`
    : `Quels sont les heures d'ouverture de ${business.name} ?`;
  const answerHours = (businessHours && businessHours.length > 0)
    ? (isEnglish
        ? `The opening hours of ${business.name} are displayed in the "Opening Hours" section above. We recommend checking them or contacting the establishment directly to confirm.`
        : `Les heures d'ouverture de ${business.name} sont affichées dans la section "Heures d'ouverture" ci-dessus. Nous vous recommandons de les consulter ou de contacter directement l'établissement pour confirmer.`)
    : (isEnglish
        ? `Opening hours for ${business.name} are not available on this listing. We recommend contacting the establishment directly to obtain this information.`
        : `Les heures d'ouverture de ${business.name} ne sont pas disponibles sur cette fiche. Nous vous recommandons de contacter directement l'établissement pour obtenir cette information.`);

  faqItems.push({
    '@type': 'Question',
    name: questionHours,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answerHours
    }
  });

  // Question 6: Industry/Category
  let categoryName = null;
  if (business.main_category) {
    categoryName = isEnglish ? business.main_category.label_en : business.main_category.label_fr;
  } else if (business.primary_main_category_fr || business.primary_main_category_en) {
    categoryName = isEnglish ? business.primary_main_category_en : business.primary_main_category_fr;
  }

  if (categoryName) {
    const questionIndustry = isEnglish
      ? `What industry does ${business.name} operate in?`
      : `Dans quel domaine œuvre ${business.name} ?`;
    const answerIndustry = isEnglish
      ? `${business.name} operates in the industry: ${categoryName}.`
      : `${business.name} œuvre dans le domaine : ${categoryName}.`;

    faqItems.push({
      '@type': 'Question',
      name: questionIndustry,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerIndustry
      }
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems
  };
};
