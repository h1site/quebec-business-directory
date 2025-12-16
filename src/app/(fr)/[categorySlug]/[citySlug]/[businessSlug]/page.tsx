import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { generateSlug, getCategorySlug } from '@/lib/utils'
import { generateBusinessSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/schema'
import type { Business } from '@/types/business'
import BusinessDetails from '@/components/BusinessDetails'

interface Props {
  params: Promise<{
    categorySlug: string
    citySlug: string
    businessSlug: string
  }>
}

// ISR: Revalidate every 24 hours
export const revalidate = 86400

async function getBusiness(slug: string): Promise<Business | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Business
}

async function getRelatedBusinesses(business: Business): Promise<Business[]> {
  if (!business.region) return []

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('id, slug, name, city, region, main_category_slug, google_rating, description')
    .eq('region', business.region)
    .neq('id', business.id)
    .not('slug', 'is', null)
    .not('city', 'is', null)
    .limit(50)

  if (!data) return []

  // Shuffle and take 3
  const shuffled = data.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3) as Business[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug, categorySlug, citySlug } = await params
  const business = await getBusiness(businessSlug)

  if (!business) {
    return {
      title: 'Entreprise non trouvée',
    }
  }

  const title = `${business.name} - ${business.city}`

  // Truncate description properly (at word boundary, max 155 chars + "...")
  const truncateDescription = (text: string, maxLen = 155): string => {
    if (text.length <= maxLen) return text
    const truncated = text.slice(0, maxLen)
    const lastSpace = truncated.lastIndexOf(' ')
    return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
  }

  const description = business.ai_description
    ? truncateDescription(business.ai_description)
    : business.description
      ? truncateDescription(business.description)
      : `${business.name} à ${business.city}. Trouvez les coordonnées, avis et informations complètes.`

  const canonical = `https://registreduquebec.com/${categorySlug}/${citySlug}/${businessSlug}`
  const enCategorySlug = getCategorySlug(categorySlug, 'en')

  return {
    title,
    description,
    openGraph: {
      title: `${business.name} - ${business.city} | Registre du Québec`,
      description,
      type: 'website',
      locale: 'fr_CA',
      url: canonical,
      images: business.logo_url
        ? [{ url: business.logo_url, alt: `Logo de ${business.name}` }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical,
      languages: {
        'fr-CA': `/${categorySlug}/${citySlug}/${businessSlug}`,
        'en-CA': `/en/${enCategorySlug}/${citySlug}/${businessSlug}`,
      },
    },
  }
}

export default async function BusinessPage({ params }: Props) {
  const { businessSlug, categorySlug, citySlug } = await params
  const business = await getBusiness(businessSlug)

  if (!business) {
    notFound()
  }

  // Validate URL matches business data
  const correctCitySlug = generateSlug(business.city || '')
  const correctCategorySlug = business.main_category_slug || 'entreprise'

  // If URL doesn't match, let middleware handle redirect
  // For now, we just serve the page

  const relatedBusinesses = await getRelatedBusinesses(business)

  // Generate Schema.org JSON-LD
  const businessSchema = generateBusinessSchema(business, false)
  const faqSchema = generateFAQSchema(business, false)
  const breadcrumbSchema = generateBreadcrumbSchema(business, categorySlug, citySlug, false)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [businessSchema, faqSchema, breadcrumbSchema],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BusinessDetails business={business} relatedBusinesses={relatedBusinesses} />
    </>
  )
}
