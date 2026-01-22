import { redirect, notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{
    category: string
    city: string
    slug: string
  }>
}

// List of valid category slugs (EN versions)
const validCategories = [
  'agriculture-et-environnement',
  'arts-medias-et-divertissement',
  'automobile-et-transport',
  'commerce-de-detail',
  'construction-et-renovation',
  'education-et-formation',
  'finance-assurance-et-juridique',
  'immobilier',
  'industrie-fabrication-et-logistique',
  'maison-et-services-domestiques',
  'organismes-publics-et-communautaires',
  'restauration-et-alimentation',
  'sante-et-bien-etre',
  'services-funeraires',
  'services-professionnels',
  'soins-a-domicile',
  'sports-et-loisirs',
  'technologie-et-informatique',
  'technology',
  'tourisme-et-hebergement',
  'construction-and-renovation',
]

export default async function LegacyCategoryPageEN({ params }: Props) {
  const { category, city, slug } = await params

  // Check if this is a valid category route
  if (!validCategories.includes(category)) {
    notFound()
  }

  // Check if business exists
  const supabase = createServiceClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('slug')
    .eq('slug', slug)
    .single()

  if (business) {
    // Redirect to new URL format
    redirect(`/en/company/${slug}`)
  }

  notFound()
}
