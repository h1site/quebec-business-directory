import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{
    categorySlug: string
    citySlug: string
    businessSlug: string
  }>
}

// Redirect old URLs to new simplified structure
export default async function BusinessPageRedirectEN({ params }: Props) {
  const { businessSlug } = await params

  // Verify business exists before redirecting
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('slug')
    .eq('slug', businessSlug)
    .single()

  if (!data) {
    // Business not found, let Next.js handle 404
    const { notFound } = await import('next/navigation')
    notFound()
  }

  // 301 redirect to new simplified URL
  redirect(`/company/${businessSlug}`)
}
