import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  HeroSection,
  CategoriesSection,
  CitiesSection,
  StatsSection,
  AboutSection,
} from '@/components/home'

// Fully static page - no server calls
export const dynamic = 'force-static'

const TOTAL_BUSINESSES = 48000

// Static categories - update when categories change
const CATEGORIES = [
  { id: '1', slug: 'agriculture-et-environnement', label_fr: 'Agriculture et environnement' },
  { id: '2', slug: 'arts-medias-et-divertissement', label_fr: 'Arts, médias et divertissement' },
  { id: '3', slug: 'automobile-et-transport', label_fr: 'Automobile et transport' },
  { id: '4', slug: 'commerce-de-detail', label_fr: 'Commerce de détail' },
  { id: '5', slug: 'construction-et-renovation', label_fr: 'Construction et rénovation' },
  { id: '6', slug: 'education-et-formation', label_fr: 'Éducation et formation' },
  { id: '7', slug: 'finance-assurance-et-juridique', label_fr: 'Finance, assurance et juridique' },
  { id: '8', slug: 'immobilier', label_fr: 'Immobilier' },
  { id: '9', slug: 'industrie-fabrication-et-logistique', label_fr: 'Industrie, fabrication et logistique' },
  { id: '10', slug: 'maison-et-services-domestiques', label_fr: 'Maison et services domestiques' },
  { id: '11', slug: 'organismes-publics-et-communautaires', label_fr: 'Organismes publics et communautaires' },
  { id: '12', slug: 'restauration-et-alimentation', label_fr: 'Restauration et alimentation' },
  { id: '13', slug: 'sante-et-bien-etre', label_fr: 'Santé et bien-être' },
  { id: '14', slug: 'services-funeraires', label_fr: 'Services funéraires' },
  { id: '15', slug: 'services-professionnels', label_fr: 'Services professionnels' },
  { id: '16', slug: 'soins-a-domicile', label_fr: 'Soins à domicile' },
  { id: '17', slug: 'sports-et-loisirs', label_fr: 'Sports et loisirs' },
  { id: '18', slug: 'technologie-et-informatique', label_fr: 'Technologie et informatique' },
  { id: '19', slug: 'tourisme-et-hebergement', label_fr: 'Tourisme et hébergement' },
]

export default function HomePage() {

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
        <HeroSection totalBusinesses={TOTAL_BUSINESSES} />
        <CategoriesSection categories={CATEGORIES} />
        <CitiesSection />
        <StatsSection />
        <AboutSection />
      </main>

      <Footer />
    </>
  )
}
