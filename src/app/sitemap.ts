import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { categorySlugsFrToEn } from '@/lib/category-slugs'

function generateSlug(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://registreduquebec.com'

  // Static pages with language alternates
  const staticPages: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1.0,
      changeFrequency: 'daily',
      alternates: {
        languages: {
          'fr-CA': baseUrl,
          'en-CA': `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      priority: 1.0,
      changeFrequency: 'daily',
      alternates: {
        languages: {
          'fr-CA': baseUrl,
          'en-CA': `${baseUrl}/en`,
        },
      },
    },
    // Search
    {
      url: `${baseUrl}/recherche`,
      lastModified: new Date(),
      priority: 0.9,
      changeFrequency: 'daily',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/recherche`,
          'en-CA': `${baseUrl}/en/search`,
        },
      },
    },
    {
      url: `${baseUrl}/en/search`,
      lastModified: new Date(),
      priority: 0.9,
      changeFrequency: 'daily',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/recherche`,
          'en-CA': `${baseUrl}/en/search`,
        },
      },
    },
    // About
    {
      url: `${baseUrl}/a-propos`,
      lastModified: new Date(),
      priority: 0.6,
      changeFrequency: 'monthly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/a-propos`,
          'en-CA': `${baseUrl}/en/about`,
        },
      },
    },
    {
      url: `${baseUrl}/en/about`,
      lastModified: new Date(),
      priority: 0.6,
      changeFrequency: 'monthly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/a-propos`,
          'en-CA': `${baseUrl}/en/about`,
        },
      },
    },
    // FAQ
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      priority: 0.6,
      changeFrequency: 'monthly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/faq`,
          'en-CA': `${baseUrl}/en/faq`,
        },
      },
    },
    {
      url: `${baseUrl}/en/faq`,
      lastModified: new Date(),
      priority: 0.6,
      changeFrequency: 'monthly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/faq`,
          'en-CA': `${baseUrl}/en/faq`,
        },
      },
    },
    // Blog
    {
      url: `${baseUrl}/blogue`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'weekly',
    },
    // Browse categories
    {
      url: `${baseUrl}/parcourir/categories`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'weekly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/parcourir/categories`,
          'en-CA': `${baseUrl}/en/browse/categories`,
        },
      },
    },
    {
      url: `${baseUrl}/en/browse/categories`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'weekly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/parcourir/categories`,
          'en-CA': `${baseUrl}/en/browse/categories`,
        },
      },
    },
    // Browse cities
    {
      url: `${baseUrl}/parcourir/villes`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'weekly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/parcourir/villes`,
          'en-CA': `${baseUrl}/en/browse/cities`,
        },
      },
    },
    {
      url: `${baseUrl}/en/browse/cities`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'weekly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/parcourir/villes`,
          'en-CA': `${baseUrl}/en/browse/cities`,
        },
      },
    },
    // Add business
    {
      url: `${baseUrl}/entreprise/nouvelle`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: 'monthly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/entreprise/nouvelle`,
          'en-CA': `${baseUrl}/en/add-business`,
        },
      },
    },
    {
      url: `${baseUrl}/en/add-business`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: 'monthly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/entreprise/nouvelle`,
          'en-CA': `${baseUrl}/en/add-business`,
        },
      },
    },
    // Legal pages
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: new Date(),
      priority: 0.3,
      changeFrequency: 'yearly',
    },
    {
      url: `${baseUrl}/politique-confidentialite`,
      lastModified: new Date(),
      priority: 0.3,
      changeFrequency: 'yearly',
    },
  ]

  // Get categories
  const supabase = createServiceClient()
  const { data: categories } = await supabase
    .from('main_categories')
    .select('slug')

  // Category pages (French and English)
  const categoryPages: MetadataRoute.Sitemap = []
  for (const cat of categories || []) {
    const enSlug = categorySlugsFrToEn[cat.slug] || cat.slug

    // French category page
    categoryPages.push({
      url: `${baseUrl}/categorie/${cat.slug}`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'weekly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/categorie/${cat.slug}`,
          'en-CA': `${baseUrl}/en/category/${enSlug}`,
        },
      },
    })

    // English category page
    categoryPages.push({
      url: `${baseUrl}/en/category/${enSlug}`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'weekly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/categorie/${cat.slug}`,
          'en-CA': `${baseUrl}/en/category/${enSlug}`,
        },
      },
    })
  }

  // Get popular cities for city pages
  const popularCitySlugs = [
    'montreal', 'quebec', 'laval', 'gatineau', 'longueuil',
    'sherbrooke', 'saguenay', 'levis', 'trois-rivieres', 'terrebonne',
    'saint-jean-sur-richelieu', 'repentigny', 'brossard', 'drummondville',
    'saint-jerome', 'granby', 'blainville', 'saint-hyacinthe', 'dollard-des-ormeaux',
    'shawinigan', 'rimouski', 'victoriaville', 'saint-eustache', 'mascouche'
  ]

  const cityPages: MetadataRoute.Sitemap = []
  for (const citySlug of popularCitySlugs) {
    // French city page
    cityPages.push({
      url: `${baseUrl}/ville/${citySlug}`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'weekly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/ville/${citySlug}`,
          'en-CA': `${baseUrl}/en/city/${citySlug}`,
        },
      },
    })

    // English city page
    cityPages.push({
      url: `${baseUrl}/en/city/${citySlug}`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'weekly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/ville/${citySlug}`,
          'en-CA': `${baseUrl}/en/city/${citySlug}`,
        },
      },
    })
  }

  // Get quality businesses (with phone, website, and good rating)
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, city, main_category_slug, updated_at, google_rating')
    .not('phone', 'is', null)
    .not('website', 'is', null)
    .not('slug', 'is', null)
    .not('city', 'is', null)
    .gte('google_rating', 4.0) // Only businesses with 4+ rating
    .order('google_rating', { ascending: false })
    .limit(50000)

  // Business pages (French and English with alternates)
  const businessPages: MetadataRoute.Sitemap = []
  for (const biz of businesses || []) {
    const citySlug = generateSlug(biz.city || '')
    const catSlug = biz.main_category_slug || 'entreprise'
    const enCatSlug = categorySlugsFrToEn[catSlug] || catSlug
    const lastMod = biz.updated_at ? new Date(biz.updated_at) : new Date()

    // Higher priority for businesses with better ratings
    const priority = biz.google_rating >= 4.5 ? 0.8 : 0.7

    // French business page
    businessPages.push({
      url: `${baseUrl}/${catSlug}/${citySlug}/${biz.slug}`,
      lastModified: lastMod,
      priority,
      changeFrequency: 'monthly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/${catSlug}/${citySlug}/${biz.slug}`,
          'en-CA': `${baseUrl}/en/${enCatSlug}/${citySlug}/${biz.slug}`,
        },
      },
    })

    // English business page
    businessPages.push({
      url: `${baseUrl}/en/${enCatSlug}/${citySlug}/${biz.slug}`,
      lastModified: lastMod,
      priority,
      changeFrequency: 'monthly',
      alternates: {
        languages: {
          'fr-CA': `${baseUrl}/${catSlug}/${citySlug}/${biz.slug}`,
          'en-CA': `${baseUrl}/en/${enCatSlug}/${citySlug}/${biz.slug}`,
        },
      },
    })
  }

  return [...staticPages, ...categoryPages, ...cityPages, ...businessPages]
}
