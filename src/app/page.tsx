import { createServiceClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  HeroSection,
  CategoriesSection,
  CitiesSection,
  StatsSection,
  AboutSection,
  FeaturedBusinessesSection,
} from '@/components/home'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = createServiceClient()
  // Count all businesses in the database
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
  return { totalBusinesses: count || 46000 }
}

async function getCategories() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_fr')
    .order('label_fr')
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

export default async function HomePage() {
  const [stats, categories, featuredBusinesses] = await Promise.all([
    getStats(),
    getCategories(),
    getFeaturedBusinesses(),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Registre des entreprises du Québec',
    url: 'https://registreduquebec.com',
    description: 'Trouvez facilement parmi plus de 46 000 entreprises québécoises de qualité.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://registreduquebec.com/recherche?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main>
        <HeroSection totalBusinesses={stats.totalBusinesses} />
        <FeaturedBusinessesSection businesses={featuredBusinesses} />
        <CategoriesSection categories={categories} />
        <CitiesSection />
        <StatsSection />
        <AboutSection />
      </main>

      <Footer />
    </>
  )
}
