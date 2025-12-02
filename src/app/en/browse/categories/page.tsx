import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'
import { toEnglishSlug, getCategoryIcon } from '@/lib/category-slugs'

export const metadata: Metadata = {
  title: 'All Categories',
  description: 'Browse all business categories in Quebec. Find restaurants, professional services, retail stores, and more.',
}

async function getCategories() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_en')
    .order('label_en')
  return data || []
}

export default async function CategoriesPageEN() {
  const categories = await getCategories()

  return (
    <>
      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">All Categories</h1>
            <p className="text-xl text-gray-600">
              Browse businesses by category
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const englishSlug = toEnglishSlug(category.slug)
              return (
                <Link
                  key={category.id}
                  href={`/en/category/${englishSlug}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all group"
                >
                  <div className="text-3xl mb-3">
                    {getCategoryIcon(category.slug)}
                  </div>
                  <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.label_en}
                  </h2>
                </Link>
              )
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Is your business not listed?
            </h2>
            <p className="text-gray-600 mb-6">
              Add your business for free and reach more customers.
            </p>
            <Link
              href="/en/add-business"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add my business
            </Link>
          </div>
        </div>
      </main>

      <FooterEN />
    </>
  )
}
