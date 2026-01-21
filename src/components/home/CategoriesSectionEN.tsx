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
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-3">
            Browse by Category
          </h2>
          <p className="text-slate-400">
            Explore our categories to find what you need
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const englishSlug = toEnglishSlug(category.slug)
            return (
              <Link
                key={category.id}
                href={`/en/category/${englishSlug}`}
                className="group flex items-center gap-4 bg-slate-800/50 hover:bg-slate-800 p-5 rounded-xl border border-slate-700/50 hover:border-sky-500/50 transition-all hover:-translate-y-1 animate-fade-in-up"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {getCategoryIcon(category.slug)}
                </span>
                <span className="font-medium text-slate-200 group-hover:text-sky-400 transition-colors">
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
