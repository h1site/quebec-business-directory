import { createServiceClient } from '@/lib/supabase/server'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'
import {
  HeroSectionEN,
  CategoriesSectionEN,
  CitiesSectionEN,
  StatsSectionEN,
  AboutSectionEN,
} from '@/components/home'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = createServiceClient()
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
  return { totalBusinesses: count || 600000 }
}

async function getCategories() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_en')
    .order('label_en')
  return data || []
}

export default async function HomePageEN() {
  const [stats, categories] = await Promise.all([
    getStats(),
    getCategories(),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Quebec Business Registry',
    url: 'https://registreduquebec.com/en',
    description: 'Easily find over 600,000 Quebec businesses.',
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
        <CategoriesSectionEN categories={categories} />
        <CitiesSectionEN />
        <StatsSectionEN />
        <AboutSectionEN />
      </main>

      <FooterEN />
    </>
  )
}
