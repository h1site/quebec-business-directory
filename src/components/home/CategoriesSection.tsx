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
  'commerce-de-detail': '🛒',
  'construction-et-renovation': '🏗️',
  'education-et-formation': '📚',
  'finance-assurance-et-juridique': '💼',
  'immobilier': '🏠',
  'industrie-fabrication-et-logistique': '🏭',
  'maison-et-services-domestiques': '🏡',
  'organismes-publics-et-communautaires': '🏛️',
  'restauration-et-alimentation': '🍽️',
  'sante-et-bien-etre': '🏥',
  'services-funeraires': '⚱️',
  'services-professionnels': '👔',
  'soins-a-domicile': '🩺',
  'sports-et-loisirs': '⚽',
  'technologie-et-informatique': '💻',
  'tourisme-et-hebergement': '🏨',
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10 animate-fade-in">
          Parcourir par catégorie
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorie/${category.slug}`}
              className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-md hover:-translate-y-1 transition-all group animate-fade-in-up"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {categoryIcons[category.slug] || '📁'}
              </span>
              <span className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">
                {category.label_fr}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
