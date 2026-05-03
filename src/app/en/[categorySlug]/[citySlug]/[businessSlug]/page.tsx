import { permanentRedirect, notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'

interface Props {
  params: Promise<{
    categorySlug: string
    citySlug: string
    businessSlug: string
  }>
}

// Legacy URL redirect — only honor if cat/city actually match this business
// to avoid generating millions of valid 308 redirect permutations
export default async function BusinessPageRedirectEN({ params }: Props) {
  const { categorySlug, citySlug, businessSlug } = await params

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('slug, main_category_slug, city')
    .eq('slug', businessSlug)
    .single()

  if (!data) notFound()

  const businessCitySlug = data.city ? generateSlug(data.city) : null
  if (data.main_category_slug !== categorySlug || businessCitySlug !== citySlug) {
    notFound()
  }

  permanentRedirect(`/en/company/${businessSlug}`)
}
