import { redirect, notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{
    category: string
    city: string
    slug: string
  }>
}

// List of valid category slugs to distinguish from other routes
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
  'technologie',
  'tourisme-et-hebergement',
  // Old category names that might exist in traffic
  'fabrication-et-refection-de-bobines-pour-equipements-hydroelectriques-et-eoliens',
]

export default async function LegacyCategoryPage({ params }: Props) {
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
    redirect(`/entreprise/${slug}`)
  }

  notFound()
}
