import Link from 'next/link'
import { toEnglishSlug, getCategoryIcon } from '@/lib/category-slugs'

interface Category {
  id: string
  slug: string
  label_en: string
}

interface CategoriesSectionENProps {
  categories: Category[]
}

export default function CategoriesSectionEN({ categories }: CategoriesSectionENProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10 animate-fade-in">
          Browse by Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const englishSlug = toEnglishSlug(category.slug)
            return (
              <Link
                key={category.id}
                href={`/en/category/${englishSlug}`}
                className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-md hover:-translate-y-1 transition-all group animate-fade-in-up"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {getCategoryIcon(category.slug)}
                </span>
                <span className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">
                  {category.label_en}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
