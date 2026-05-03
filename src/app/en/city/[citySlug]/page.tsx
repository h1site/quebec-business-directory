import { redirect } from 'next/navigation'
import { slugToCity } from '@/lib/cities'

interface Props {
  params: Promise<{ citySlug: string }>
}

export default async function CityPageEN({ params }: Props) {
  const { citySlug } = await params
  const cityName = slugToCity(citySlug)
  redirect(`/en/search?city=${encodeURIComponent(cityName)}`)
}
