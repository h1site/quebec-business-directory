import { redirect, notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{
    city: string
    slug: string
  }>
}

export default async function LegacyBusinessPageEN({ params }: Props) {
  const { city, slug } = await params

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
