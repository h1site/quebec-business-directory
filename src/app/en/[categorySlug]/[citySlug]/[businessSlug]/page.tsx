import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { generateSlug, getCategorySlug } from '@/lib/utils'
import { generateBusinessSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/schema'
import type { Business } from '@/types/business'
import BusinessDetailsEN from '@/components/BusinessDetailsEN'

interface Props {
  params: Promise<{
    categorySlug: string
    citySlug: string
    businessSlug: string
  }>
}

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

  const shuffled = data.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3) as Business[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug, categorySlug, citySlug } = await params
  const business = await getBusiness(businessSlug)

  if (!business) {
    return {
      title: 'Business Not Found',
    }
  }

  const title = `${business.name} - ${business.city}`
  const description =
    business.description?.slice(0, 160) ||
    `${business.name} in ${business.city}. Find contact info, reviews and complete information.`

  const canonical = `https://registreduquebec.com/en/${categorySlug}/${citySlug}/${businessSlug}`
  const frCategorySlug = getCategorySlug(categorySlug, 'fr')

  return {
    title,
    description,
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
        'fr-CA': `/${frCategorySlug}/${citySlug}/${businessSlug}`,
        'en-CA': `/en/${categorySlug}/${citySlug}/${businessSlug}`,
      },
    },
  }
}

export default async function BusinessPageEN({ params }: Props) {
  const { businessSlug, categorySlug, citySlug } = await params
  const business = await getBusiness(businessSlug)

  if (!business) {
    notFound()
  }

  const relatedBusinesses = await getRelatedBusinesses(business)

  const businessSchema = generateBusinessSchema(business, true)
  const faqSchema = generateFAQSchema(business, true)
  const breadcrumbSchema = generateBreadcrumbSchema(business, categorySlug, citySlug, true)

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
