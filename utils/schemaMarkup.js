/**
 * Centralized Schema.org markup generators for SEO
 * Following Schema.org best practices with @graph structure
 */

/**
 * Generate WebSite schema with SearchAction for homepage
 * Enables Google Search Box sitelinks
 */
export function generateWebSiteSchema(isEnglish = false) {
  const siteName = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';
  const description = isEnglish
    ? 'Quebec business directory with over 600,000 businesses. Find contact information, reviews, and detailed information.'
    : 'Annuaire des entreprises du Québec avec plus de 600 000 entreprises. Trouvez coordonnées, avis et informations détaillées.';

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": "https://registreduquebec.com",
    "description": description,
    "inLanguage": [
      "fr-CA",
      "en-CA"
    ],
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "url": "https://registreduquebec.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://registreduquebec.com/logo.png",
        "width": 250,
        "height": 60
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://registreduquebec.com/recherche?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate Organization schema for Registre du Québec platform
 * Represents the website owner/operator
 */
export function generateOrganizationSchema(isEnglish = false) {
  const name = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';
  const description = isEnglish
    ? 'The largest business directory in Quebec with over 600,000 registered businesses.'
    : 'Le plus grand annuaire d\'entreprises du Québec avec plus de 600 000 entreprises enregistrées.';

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": "https://registreduquebec.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://registreduquebec.com/logo.png",
      "width": 250,
      "height": 60
    },
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "QC",
      "addressCountry": "CA"
    },
    "sameAs": [
      "https://www.facebook.com/groups/registreduquebec"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["French", "English"]
    }
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 * Improves Google's understanding of site structure
 */
export function generateBreadcrumbSchema(items, isEnglish = false) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Generate FAQPage schema for FAQ pages
 * Enables rich results with expandable Q&A in Google
 */
export function generateFAQSchema(faqs, isEnglish = false) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate Article/BlogPosting schema for blog articles
 * Improves visibility in Google News and search results
 */
export function generateArticleSchema(article, isEnglish = false) {
  const siteName = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.description,
    "image": article.image || "https://registreduquebec.com/og-default.svg",
    "author": {
      "@type": "Organization",
      "name": siteName,
      "url": "https://registreduquebec.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": "https://registreduquebec.com/logo.png"
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    },
    "articleBody": article.body,
    "inLanguage": isEnglish ? "en-CA" : "fr-CA"
  };
}

/**
 * Generate CollectionPage schema for category/city listing pages
 * Helps Google understand aggregation pages
 */
export function generateCollectionPageSchema(title, description, url, numberOfItems, isEnglish = false) {
  const siteName = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": url,
    "inLanguage": isEnglish ? "en-CA" : "fr-CA",
    "isPartOf": {
      "@type": "WebSite",
      "name": siteName,
      "url": "https://registreduquebec.com"
    },
    "numberOfItems": numberOfItems
  };
}

/**
 * Generate ImageObject schema for images
 * Improves image search visibility
 */
export function generateImageSchema(imageUrl, caption, width, height) {
  return {
    "@type": "ImageObject",
    "url": imageUrl,
    "caption": caption,
    "width": width,
    "height": height
  };
}
