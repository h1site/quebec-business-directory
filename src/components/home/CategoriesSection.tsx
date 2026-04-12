import Link from 'next/link'

interface Category {
  id: string
  slug: string
  label_fr: string
}

interface CategoriesSectionProps {
  categories: Category[]
}

const categoryIcons: Record<string, string> = {
  'agriculture-et-environnement': '🌾',
  'arts-medias-et-divertissement': '🎨',
  'automobile-et-transport': '🚗',
  'commerce-de-detail': '🛍️',
  'construction-et-renovation': '🏗️',
  'education-et-formation': '🎓',
  'finance-assurance-et-juridique': '💼',
  'immobilier': '🏠',
  'industrie-fabrication-et-logistique': '🏭',
  'maison-et-services-domestiques': '🏡',
  'organismes-publics-et-communautaires': '🏛️',
  'restauration-et-alimentation': '🍽️',
  'sante-et-bien-etre': '💊',
  'services-funeraires': '🕊️',
  'services-professionnels': '📋',
  'soins-a-domicile': '🩺',
  'sports-et-loisirs': '⚽',
  'technologie-et-informatique': '💻',
  'tourisme-et-hebergement': '🏨',
}

const popularCities = [
  { name: 'Montréal', slug: 'montreal' },
  { name: 'Québec', slug: 'quebec' },
  { name: 'Laval', slug: 'laval' },
  { name: 'Gatineau', slug: 'gatineau' },
  { name: 'Longueuil', slug: 'longueuil' },
  { name: 'Sherbrooke', slug: 'sherbrooke' },
  { name: 'Saguenay', slug: 'saguenay' },
  { name: 'Lévis', slug: 'levis' },
  { name: 'Trois-Rivières', slug: 'trois-rivieres' },
  { name: 'Terrebonne', slug: 'terrebonne' },
  { name: 'Saint-Jean-sur-Richelieu', slug: 'saint-jean-sur-richelieu' },
  { name: 'Repentigny', slug: 'repentigny' },
]

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-[100px] relative bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/background/background-overlay-dark.png)',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.02,
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Categories */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">
            Parcourir par catégorie
          </h2>
          <p className="text-gray-500">
            Explorez nos catégories pour trouver ce que vous cherchez
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorie/${category.slug}`}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 no-underline"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none shrink-0">
                  {categoryIcons[category.slug] || '📁'}
                </span>
                <span className="font-medium text-gray-900 text-xs">
                  {category.label_fr}
                </span>
              </div>
              <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Cities */}
        <div className="text-center mt-16 mb-8">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">
            Découvrir des entreprises dans votre région
          </h2>
          <p className="text-gray-500">
            Parcourez les entreprises par ville au Québec
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {popularCities.map((city) => (
            <Link
              key={city.slug}
              href={`/ville/${city.slug}`}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 no-underline"
            >
              <span className="font-medium text-gray-900 text-sm">{city.name}</span>
              <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
