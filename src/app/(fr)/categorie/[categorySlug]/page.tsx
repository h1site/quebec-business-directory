import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { categorySlugsFrToEn } from '@/lib/category-slugs'

export const revalidate = 3600 // ISR: 1 hour

interface Props {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<{ page?: string }>
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

function generateSlug(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function getCategory(slug: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_fr, description_fr')
    .eq('slug', slug)
    .single()
  return data
}

async function getBusinessesByCategory(categorySlug: string, page: number) {
  const supabase = createServiceClient()
  const limit = 24
  const offset = (page - 1) * limit

  const { data, count } = await supabase
    .from('businesses')
    .select('id, name, slug, city, main_category_slug, google_rating, google_reviews_count, phone, website', { count: 'exact' })
    .eq('main_category_slug', categorySlug)
    .not('slug', 'is', null)
    .not('city', 'is', null)
    .order('google_rating', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  return { businesses: data || [], total: count || 0 }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params
  const category = await getCategory(categorySlug)
  const enSlug = categorySlugsFrToEn[categorySlug] || categorySlug

  if (!category) {
    return { title: 'Catégorie introuvable' }
  }

  return {
    title: `${category.label_fr} au Québec - Annuaire des entreprises`,
    description: category.description_fr || `Trouvez les meilleures entreprises de ${category.label_fr} au Québec. Annuaire complet avec coordonnées et avis.`,
    alternates: {
      canonical: `https://registreduquebec.com/categorie/${categorySlug}`,
      languages: {
        'fr-CA': `https://registreduquebec.com/categorie/${categorySlug}`,
        'en-CA': `https://registreduquebec.com/en/category/${enSlug}`,
      },
    },
    openGraph: {
      title: `${category.label_fr} au Québec | Registre du Québec`,
      description: category.description_fr || `Annuaire des entreprises de ${category.label_fr} au Québec.`,
      type: 'website',
      locale: 'fr_CA',
      alternateLocale: 'en_CA',
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categorySlug } = await params
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || '1', 10)

  const [category, { businesses, total }] = await Promise.all([
    getCategory(categorySlug),
    getBusinessesByCategory(categorySlug, page),
  ])

  if (!category) {
    notFound()
  }

  const totalPages = Math.ceil(total / 24)
  const icon = categoryIcons[categorySlug] || '📁'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.label_fr} au Québec`,
    description: category.description_fr,
    url: `https://registreduquebec.com/categorie/${categorySlug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Header */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="text-sm mb-4 flex items-center gap-2 text-blue-200">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>›</span>
              <Link href="/parcourir/categories" className="hover:text-white transition-colors">Catégories</Link>
              <span>›</span>
              <span className="text-white">{category.label_fr}</span>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-5xl">{icon}</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {category.label_fr}
                </h1>
                <p className="mt-2 text-blue-100">
                  {total.toLocaleString('fr-CA')} entreprises au Québec
                </p>
              </div>
            </div>

            {category.description_fr && (
              <p className="mt-4 text-blue-100 max-w-2xl">
                {category.description_fr}
              </p>
            )}
          </div>
        </section>

        {/* Business Grid */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            {businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((biz) => {
                  const citySlug = generateSlug(biz.city || '')
                  const catSlug = biz.main_category_slug || 'entreprise'
                  const hasContact = biz.phone || biz.website

                  return (
                    <Link
                      key={biz.id}
                      href={`/${catSlug}/${citySlug}/${biz.slug}`}
                      className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 transition-all group overflow-hidden"
                    >
                      <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {biz.name}
                        </h2>
                        <p className="text-gray-600 mt-2 text-sm flex items-center gap-2">
                          <span>📍</span>
                          {biz.city}
                        </p>

                        {/* Contact badges */}
                        {hasContact && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {biz.phone && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                📞
                              </span>
                            )}
                            {biz.website && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                🌐
                              </span>
                            )}
                          </div>
                        )}

                        {/* Rating */}
                        {biz.google_rating && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="font-bold text-gray-900">{biz.google_rating}</span>
                            </div>
                            {biz.google_reviews_count && (
                              <span className="text-xs text-gray-500">
                                ({biz.google_reviews_count} avis)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">{icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune entreprise trouvée
                </h3>
                <p className="text-gray-500">
                  Aucune entreprise dans cette catégorie pour le moment.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={`/categorie/${categorySlug}?page=${page - 1}`}
                    className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 font-medium text-gray-700 border border-gray-200"
                  >
                    ← Précédent
                  </Link>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Link
                        key={pageNum}
                        href={`/categorie/${categorySlug}?page=${pageNum}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    )
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-gray-400">...</span>
                      <span className="px-3 py-2 text-gray-600 text-sm">
                        Page {page} sur {totalPages}
                      </span>
                    </>
                  )}
                </div>

                {page < totalPages && (
                  <Link
                    href={`/categorie/${categorySlug}?page=${page + 1}`}
                    className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 font-medium text-gray-700 border border-gray-200"
                  >
                    Suivant →
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
