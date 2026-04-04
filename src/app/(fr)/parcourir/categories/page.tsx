import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const revalidate = 604800 // 7 days

export const metadata: Metadata = {
  title: 'Toutes les catégories',
  description: 'Parcourez toutes les catégories d\'entreprises au Québec. Trouvez des restaurants, services professionnels, commerces et plus.',
}

async function getCategories() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_fr')
    .order('label_fr')
  return data || []
}

const categoryIcons: Record<string, string> = {
  'restaurants': '🍽️',
  'sante': '🏥',
  'services-professionnels': '💼',
  'construction': '🏗️',
  'commerce-detail': '🛒',
  'beaute-bien-etre': '💅',
  'automobile': '🚗',
  'immobilier': '🏠',
  'education': '📚',
  'divertissement': '🎭',
  'sports-loisirs': '⚽',
  'technologie': '💻',
  'finance': '💰',
  'transport': '🚚',
  'hebergement': '🏨',
  'alimentation': '🥖',
  'mode-vetements': '👔',
  'animaux': '🐾',
  'maison-jardin': '🏡',
  'evenements': '🎉',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Toutes les catégories</h1>
            <p className="text-xl text-gray-600">
              Parcourez les entreprises par catégorie
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categorie/${category.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all group"
              >
                <div className="text-3xl mb-3">
                  {categoryIcons[category.slug] || '📁'}
                </div>
                <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.label_fr}
                </h2>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Votre entreprise n&apos;est pas répertoriée?
            </h2>
            <p className="text-gray-600 mb-6">
              Ajoutez votre entreprise gratuitement et atteignez plus de clients.
            </p>
            <Link
              href="/entreprise/nouvelle"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter mon entreprise
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
