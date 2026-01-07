import type { Business } from '@/types/business'
import { generateSlug } from '@/lib/utils'

export function generateBusinessSchema(business: Business, isEnglish = false) {
  const description = isEnglish ? business.description_en : business.description
  const defaultDesc = isEnglish
    ? `${business.name} in ${business.city}`
    : `${business.name} à ${business.city}`

  const baseUrl = 'https://registreduquebec.com'
  const langPrefix = isEnglish ? '/en' : ''
  const citySlug = generateSlug(business.city || '')
  const categorySlug = isEnglish ? 'business' : 'entreprise'
  const businessUrl = `${baseUrl}${langPrefix}/${categorySlug}/${citySlug}/${business.slug}`

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': businessUrl,
    name: business.name,
    description: description || defaultDesc,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address || '',
      addressLocality: business.city || '',
      addressRegion: 'QC',
      postalCode: business.postal_code || '',
      addressCountry: 'CA',
    },
    // Area served - the city and region
    areaServed: {
      '@type': 'City',
      name: business.city || 'Quebec',
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: business.region || 'Quebec',
      },
    },
  }

  if (business.phone) schema.telephone = business.phone
  if (business.website) schema.url = business.website
  if (business.email) schema.email = business.email

  // Add NEQ as identifier
  if (business.neq) {
    schema.identifier = {
      '@type': 'PropertyValue',
      name: 'NEQ',
      value: business.neq,
    }
  }

  if (business.logo_url) {
    schema.image = {
      '@type': 'ImageObject',
      '@id': `${businessUrl}#logo`,
      url: business.logo_url,
      caption: isEnglish ? `${business.name} logo` : `Logo de ${business.name}`,
    }
    schema.logo = { '@id': `${businessUrl}#logo` }
  }

  // Social media profiles
  const socialLinks: string[] = []
  if (business.facebook_url) socialLinks.push(business.facebook_url)
  if (business.instagram_url) socialLinks.push(business.instagram_url)
  if (business.linkedin_url) socialLinks.push(business.linkedin_url)
  if (business.twitter_url) socialLinks.push(business.twitter_url)
  if (socialLinks.length > 0) schema.sameAs = socialLinks

  // Geographic coordinates
  if (business.latitude && business.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    }
  }

  // Ratings
  if (business.google_rating && business.google_reviews_count) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.google_rating,
      reviewCount: business.google_reviews_count,
      bestRating: '5',
      worstRating: '1',
    }
  }

  // Opening hours
  if (business.opening_hours && typeof business.opening_hours === 'object') {
    const daysMap: Record<string, string> = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    }

    const openingHours = []
    for (const [day, hours] of Object.entries(business.opening_hours)) {
      const dayName = daysMap[day.toLowerCase()]
      if (dayName && hours && hours.open && hours.close) {
        openingHours.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: dayName,
          opens: hours.open,
          closes: hours.close,
        })
      }
    }
    if (openingHours.length > 0) {
      schema.openingHoursSpecification = openingHours
    }
  }

  // Products and services as offer catalog
  if (business.products_services) {
    const services = business.products_services
      .split('\n')
      .filter(Boolean)
      .map((service) => service.trim())
      .filter((service) => service.length > 0)

    if (services.length > 0) {
      schema.hasOfferCatalog = {
        '@type': 'OfferCatalog',
        name: isEnglish ? 'Products and Services' : 'Produits et services',
        itemListElement: services.map((service, index) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service,
          },
          position: index + 1,
        })),
      }
    }
  }

  return schema
}

export function generateFAQSchema(business: Business, isEnglish = false) {
  const faqItems: Array<{ '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }> = []

  // Question: City
  if (business.city) {
    faqItems.push({
      '@type': 'Question',
      name: isEnglish
        ? `In which city is ${business.name} located?`
        : `Dans quelle ville se situe ${business.name} ?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isEnglish
          ? `${business.name} is located in ${business.city}${business.region ? `, ${business.region}` : ''}.`
          : `${business.name} se situe à ${business.city}${business.region ? `, ${business.region}` : ''}.`,
      },
    })
  }

  // Question: Address
  if (business.address) {
    const fullAddress = `${business.address}, ${business.city}, ${business.province || 'QC'} ${business.postal_code || ''}`
    faqItems.push({
      '@type': 'Question',
      name: isEnglish
        ? `What is the address of ${business.name}?`
        : `À quelle adresse se situe ${business.name} ?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: fullAddress,
      },
    })
  }

  // Question: Phone
  faqItems.push({
    '@type': 'Question',
    name: isEnglish
      ? `Does ${business.name} have a phone number?`
      : `Est-ce que ${business.name} a un numéro de téléphone ?`,
    acceptedAnswer: {
      '@type': 'Answer',
      text: business.phone
        ? (isEnglish
            ? `Yes, you can contact ${business.name} at ${business.phone}.`
            : `Oui, vous pouvez contacter ${business.name} au ${business.phone}.`)
        : (isEnglish
            ? `Phone information for ${business.name} is not available.`
            : `Les informations de téléphone pour ${business.name} ne sont pas disponibles.`),
    },
  })

  // Question: Website
  faqItems.push({
    '@type': 'Question',
    name: isEnglish
      ? `Does ${business.name} have a website?`
      : `${business.name} a-t-il un site internet ?`,
    acceptedAnswer: {
      '@type': 'Answer',
      text: business.website
        ? (isEnglish
            ? `Yes, ${business.name} has a website.`
            : `Oui, ${business.name} a un site internet.`)
        : (isEnglish
            ? `Website information for ${business.name} is not available.`
            : `Les informations de site internet pour ${business.name} ne sont pas disponibles.`),
    },
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  }
}

export function generateBreadcrumbSchema(
  business: Business,
  categorySlug: string,
  citySlug: string,
  isEnglish = false
) {
  const baseUrl = 'https://registreduquebec.com'
  const langPrefix = isEnglish ? '/en' : ''

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isEnglish ? 'Home' : 'Accueil',
        item: `${baseUrl}${langPrefix}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: business.city || (isEnglish ? 'Quebec' : 'Québec'),
        item: `${baseUrl}${langPrefix}/${isEnglish ? 'city' : 'ville'}/${citySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: business.name,
        item: `${baseUrl}${langPrefix}/${categorySlug}/${citySlug}/${business.slug}`,
      },
    ],
  }
}

// ============================================
// Simplified URL schema functions
// For /entreprise/[slug] and /company/[slug]
// ============================================

export function generateBusinessSchemaSimple(business: Business, isEnglish = false) {
  const description = isEnglish ? business.description_en : business.description
  const defaultDesc = isEnglish
    ? `${business.name} in ${business.city}`
    : `${business.name} à ${business.city}`

  const baseUrl = 'https://registreduquebec.com'
  const businessUrl = isEnglish
    ? `${baseUrl}/company/${business.slug}`
    : `${baseUrl}/entreprise/${business.slug}`

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': businessUrl,
    name: business.name,
    description: description || defaultDesc,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address || '',
      addressLocality: business.city || '',
      addressRegion: 'QC',
      postalCode: business.postal_code || '',
      addressCountry: 'CA',
    },
    areaServed: {
      '@type': 'City',
      name: business.city || 'Quebec',
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: business.region || 'Quebec',
      },
    },
  }

  if (business.phone) schema.telephone = business.phone
  if (business.website) schema.url = business.website
  if (business.email) schema.email = business.email

  if (business.neq) {
    schema.identifier = {
      '@type': 'PropertyValue',
      name: 'NEQ',
      value: business.neq,
    }
  }

  if (business.logo_url) {
    schema.image = {
      '@type': 'ImageObject',
      '@id': `${businessUrl}#logo`,
      url: business.logo_url,
      caption: isEnglish ? `${business.name} logo` : `Logo de ${business.name}`,
    }
    schema.logo = { '@id': `${businessUrl}#logo` }
  }

  const socialLinks: string[] = []
  if (business.facebook_url) socialLinks.push(business.facebook_url)
  if (business.instagram_url) socialLinks.push(business.instagram_url)
  if (business.linkedin_url) socialLinks.push(business.linkedin_url)
  if (business.twitter_url) socialLinks.push(business.twitter_url)
  if (socialLinks.length > 0) schema.sameAs = socialLinks

  if (business.latitude && business.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    }
  }

  if (business.google_rating && business.google_reviews_count) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.google_rating,
      reviewCount: business.google_reviews_count,
      bestRating: '5',
      worstRating: '1',
    }
  }

  if (business.opening_hours && typeof business.opening_hours === 'object') {
    const daysMap: Record<string, string> = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    }

    const openingHours = []
    for (const [day, hours] of Object.entries(business.opening_hours)) {
      const dayName = daysMap[day.toLowerCase()]
      if (dayName && hours && hours.open && hours.close) {
        openingHours.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: dayName,
          opens: hours.open,
          closes: hours.close,
        })
      }
    }
    if (openingHours.length > 0) {
      schema.openingHoursSpecification = openingHours
    }
  }

  if (business.products_services) {
    const services = business.products_services
      .split('\n')
      .filter(Boolean)
      .map((service) => service.trim())
      .filter((service) => service.length > 0)

    if (services.length > 0) {
      schema.hasOfferCatalog = {
        '@type': 'OfferCatalog',
        name: isEnglish ? 'Products and Services' : 'Produits et services',
        itemListElement: services.map((service, index) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service,
          },
          position: index + 1,
        })),
      }
    }
  }

  return schema
}

export function generateFAQSchemaSimple(business: Business, isEnglish = false) {
  const faqItems: Array<{ '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }> = []

  if (business.city) {
    faqItems.push({
      '@type': 'Question',
      name: isEnglish
        ? `In which city is ${business.name} located?`
        : `Dans quelle ville se situe ${business.name} ?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isEnglish
          ? `${business.name} is located in ${business.city}${business.region ? `, ${business.region}` : ''}.`
          : `${business.name} se situe à ${business.city}${business.region ? `, ${business.region}` : ''}.`,
      },
    })
  }

  if (business.address) {
    const fullAddress = `${business.address}, ${business.city}, ${business.province || 'QC'} ${business.postal_code || ''}`
    faqItems.push({
      '@type': 'Question',
      name: isEnglish
        ? `What is the address of ${business.name}?`
        : `À quelle adresse se situe ${business.name} ?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: fullAddress,
      },
    })
  }

  faqItems.push({
    '@type': 'Question',
    name: isEnglish
      ? `Does ${business.name} have a phone number?`
      : `Est-ce que ${business.name} a un numéro de téléphone ?`,
    acceptedAnswer: {
      '@type': 'Answer',
      text: business.phone
        ? (isEnglish
            ? `Yes, you can contact ${business.name} at ${business.phone}.`
            : `Oui, vous pouvez contacter ${business.name} au ${business.phone}.`)
        : (isEnglish
            ? `Phone information for ${business.name} is not available.`
            : `Les informations de téléphone pour ${business.name} ne sont pas disponibles.`),
    },
  })

  faqItems.push({
    '@type': 'Question',
    name: isEnglish
      ? `Does ${business.name} have a website?`
      : `${business.name} a-t-il un site internet ?`,
    acceptedAnswer: {
      '@type': 'Answer',
      text: business.website
        ? (isEnglish
            ? `Yes, ${business.name} has a website.`
            : `Oui, ${business.name} a un site internet.`)
        : (isEnglish
            ? `Website information for ${business.name} is not available.`
            : `Les informations de site internet pour ${business.name} ne sont pas disponibles.`),
    },
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  }
}

export function generateBreadcrumbSchemaSimple(business: Business, isEnglish = false) {
  const baseUrl = 'https://registreduquebec.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isEnglish ? 'Home' : 'Accueil',
        item: isEnglish ? `${baseUrl}/en` : baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isEnglish ? 'Businesses' : 'Entreprises',
        item: isEnglish ? `${baseUrl}/en/search` : `${baseUrl}/recherche`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: business.name,
        item: isEnglish
          ? `${baseUrl}/company/${business.slug}`
          : `${baseUrl}/entreprise/${business.slug}`,
      },
    ],
  }
}
