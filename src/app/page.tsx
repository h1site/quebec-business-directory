import { createServiceClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  HeroSection,
  CategoriesSection,
  CitiesSection,
  StatsSection,
  AboutSection,
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
    .select('id, slug, label_fr')
    .order('label_fr')
  return data || []
}

export default async function HomePage() {
  const [stats, categories] = await Promise.all([
    getStats(),
    getCategories(),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Registre des entreprises du Québec',
    url: 'https://registreduquebec.com',
    description: 'Trouvez facilement parmi plus de 600 000 entreprises québécoises.',
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
        <CategoriesSection categories={categories} />
        <CitiesSection />
        <StatsSection />
        <AboutSection />
      </main>

      <Footer />
    </>
  )
}
