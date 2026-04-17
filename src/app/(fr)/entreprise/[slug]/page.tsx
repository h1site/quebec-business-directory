import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { generateBusinessSchemaSimple, generateFAQSchemaSimple, generateBreadcrumbSchemaSimple } from '@/lib/schema'
import type { Business } from '@/types/business'
import BusinessDetails from '@/components/BusinessDetails'
import trafficSlugs from '@/data/traffic-slugs.json'

// Set of slugs that have traffic (keep even without website)
const trafficSlugSet = new Set(trafficSlugs.slugs)

interface Props {
  params: Promise<{
    slug: string
  }>
}

// ISR: Revalidate every 24 hours, allow dynamic params
export const revalidate = 86400
export const dynamicParams = true

async function getBusiness(slug: string): Promise<Business | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('verification_confidence', 'high')
    .single()

  if (error || !data) return null
  return data as Business
}

async function getCityBusinesses(business: Business): Promise<Business[]> {
  if (!business.city) return []

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('id, slug, name, city, google_rating, main_category_slug')
    .eq('city', business.city)
    .neq('id', business.id)
    .not('slug', 'is', null)
    .eq('verification_confidence', 'high')
    .limit(50)

  if (!data) return []
  const shuffled = data.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3) as Business[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) {
    return {
      title: 'Entreprise non trouvée',
    }
  }

  const title = `${business.name} - ${business.city}`

  // Truncate description properly (at word boundary, max 155 chars + "...")
  const truncateDescription = (text: string, maxLen = 150): string => {
    if (text.length <= maxLen) return text
    const truncated = text.slice(0, maxLen)
    const lastSpace = truncated.lastIndexOf(' ')
    return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
  }

  // Use AI description if available, otherwise build a rich description
  let description: string
  if (business.ai_description) {
    description = truncateDescription(business.ai_description)
  } else if (business.google_rating && business.google_reviews_count) {
    description = `${business.name} à ${business.city}. Note: ${business.google_rating}/5 (${business.google_reviews_count} avis). Coordonnées, horaires et informations.`
  } else if (business.description) {
    description = truncateDescription(business.description)
  } else {
    description = `${business.name} à ${business.city}, Québec. Trouvez les coordonnées, avis et informations complètes.`
  }

  const canonical = `https://registreduquebec.com/entreprise/${slug}`

  // Only index if business has unique content (avoid thin content penalty)
  const hasUniqueContent = !!(business.ai_description || business.ai_seo_content)
  const isHighQuality = business.verification_confidence === 'high' || business.is_claimed
  const shouldIndex = hasUniqueContent && isHighQuality

  return {
    title,
    description,
    robots: { index: shouldIndex, follow: true },
    openGraph: {
      title: `${business.name} - ${business.city} | Registre du Québec`,
      description,
      type: 'website',
      locale: 'fr_CA',
      url: canonical,
      images: business.logo_url
        ? [{ url: business.logo_url, width: 400, height: 400, alt: `Logo de ${business.name}` }]
        : [{ url: 'https://registreduquebec.com/images/logos/logo.webp', width: 512, height: 512, alt: 'Registre du Québec' }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: business.logo_url
        ? [business.logo_url]
        : ['https://registreduquebec.com/images/logos/logo.webp'],
    },
    alternates: {
      canonical,
      languages: {
        'x-default': `/entreprise/${slug}`,
        'fr-CA': `/entreprise/${slug}`,
        'en-CA': `/en/company/${slug}`,
      },
    },
  }
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) {
    notFound()
  }

  // 404 if no website AND not enriched AND not in traffic list
  if (!business.website && !business.ai_description && !trafficSlugSet.has(slug)) {
    notFound()
  }

  const cityBusinesses = await getCityBusinesses(business)

  // Generate Schema.org JSON-LD
  const businessSchema = generateBusinessSchemaSimple(business, false)
  const faqSchema = generateFAQSchemaSimple(business, false)
  const breadcrumbSchema = generateBreadcrumbSchemaSimple(business, false)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BusinessDetails business={business} cityBusinesses={cityBusinesses} />
    </>
  )
}
