import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { generateBusinessSchemaSimple, generateFAQSchemaSimple, generateBreadcrumbSchemaSimple } from '@/lib/schema'
import type { Business } from '@/types/business'
import BusinessDetailsEN from '@/components/BusinessDetailsEN'

interface Props {
  params: Promise<{
    slug: string
  }>
}

// ISR: Revalidate every 24 hours
export const revalidate = 86400
export const dynamic = 'force-static'
export const dynamicParams = true

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

  const shuffled = data.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3) as Business[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) {
    return {
      title: 'Business Not Found',
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

  const description = `Business listing for ${business.name} located in ${business.city}, in the province of Quebec.`

  const canonical = `https://registreduquebec.com/company/${slug}`

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title: `${business.name} - ${business.city} | Quebec Registry`,
      description,
      type: 'website',
      locale: 'en_CA',
      url: canonical,
      images: business.logo_url
        ? [{ url: business.logo_url, alt: `${business.name} logo` }]
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
        'fr-CA': `/entreprise/${slug}`,
        'en-CA': `/company/${slug}`,
      },
    },
  }
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) {
    notFound()
  }

  const relatedBusinesses = await getRelatedBusinesses(business)

  const businessSchema = generateBusinessSchemaSimple(business, true)
  const faqSchema = generateFAQSchemaSimple(business, true)
  const breadcrumbSchema = generateBreadcrumbSchemaSimple(business, true)

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
      <BusinessDetailsEN business={business} relatedBusinesses={relatedBusinesses} />
    </>
  )
}
