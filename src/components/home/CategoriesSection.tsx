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
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-3">
            Parcourir par catégorie
          </h2>
          <p className="text-slate-400">
            Explorez nos catégories pour trouver ce que vous cherchez
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorie/${category.slug}`}
              className="group flex items-center gap-4 bg-slate-800/50 hover:bg-slate-800 p-5 rounded-xl border border-slate-700/50 hover:border-sky-500/50 transition-all hover:-translate-y-1 animate-fade-in-up"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {categoryIcons[category.slug] || '📁'}
              </span>
              <span className="font-medium text-slate-200 group-hover:text-sky-400 transition-colors">
                {category.label_fr}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
