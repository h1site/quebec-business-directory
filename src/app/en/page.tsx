import { createServiceClient } from '@/lib/supabase/server'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'
import {
  HeroSectionEN,
  CategoriesSectionEN,
  CitiesSectionEN,
  StatsSectionEN,
  AboutSectionEN,
  FeaturedBusinessesSectionEN,
} from '@/components/home'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = createServiceClient()
  // Count businesses with website
  const { count: withWebsite } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('website', 'is', null)

  // Add traffic slugs count (businesses without website but with traffic)
  const trafficSlugsCount = 1912

  return { totalBusinesses: (withWebsite || 46000) + trafficSlugsCount }
}

async function getCategories() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_en')
    .order('label_en')
  return data || []
}

async function getFeaturedBusinesses() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('id, name, slug, city, google_rating, google_reviews_count, ai_description, main_category_slug')
    .not('ai_description', 'is', null)
    .not('google_rating', 'is', null)
    .gte('google_rating', 4.0)
    .order('google_reviews_count', { ascending: false })
    .limit(9)
  return data || []
}

export default async function HomePageEN() {
  const [stats, categories, featuredBusinesses] = await Promise.all([
    getStats(),
    getCategories(),
    getFeaturedBusinesses(),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Quebec Business Registry',
    url: 'https://registreduquebec.com/en',
    description: 'Easily find over 46,000 quality Quebec businesses.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://registreduquebec.com/en/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeaderEN />

      <main>
        <HeroSectionEN totalBusinesses={stats.totalBusinesses} />
        <FeaturedBusinessesSectionEN businesses={featuredBusinesses} />
        <CategoriesSectionEN categories={categories} />
        <CitiesSectionEN />
        <StatsSectionEN />
        <AboutSectionEN />
      </main>

      <FooterEN />
    </>
  )
}
