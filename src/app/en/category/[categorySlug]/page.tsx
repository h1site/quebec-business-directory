import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'
import { toFrenchSlug, toEnglishSlug, getCategoryIconByEnSlug } from '@/lib/category-slugs'

export const revalidate = 3600 // ISR: 1 hour

interface Props {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<{ page?: string }>
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

async function getCategory(frenchSlug: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_en, description_en')
    .eq('slug', frenchSlug)
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
  const { categorySlug: englishSlug } = await params
  const frenchSlug = toFrenchSlug(englishSlug)
  const category = await getCategory(frenchSlug)

  if (!category) {
    return { title: 'Category not found' }
  }

  return {
    title: `${category.label_en} in Quebec - Business Directory`,
    description: category.description_en || `Find the best ${category.label_en} businesses in Quebec. Complete directory with contact information and reviews.`,
    alternates: {
      canonical: `https://registreduquebec.com/en/category/${englishSlug}`,
      languages: {
        'fr-CA': `https://registreduquebec.com/categorie/${frenchSlug}`,
        'en-CA': `https://registreduquebec.com/en/category/${englishSlug}`,
      },
    },
    openGraph: {
      title: `${category.label_en} in Quebec | Quebec Business Registry`,
      description: category.description_en || `Directory of ${category.label_en} businesses in Quebec.`,
      type: 'website',
      locale: 'en_CA',
      alternateLocale: 'fr_CA',
    },
  }
}

export default async function CategoryPageEN({ params, searchParams }: Props) {
  const { categorySlug: englishSlug } = await params
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || '1', 10)

  // Convert English slug to French slug for database query
  const frenchSlug = toFrenchSlug(englishSlug)

  const [category, { businesses, total }] = await Promise.all([
    getCategory(frenchSlug),
    getBusinessesByCategory(frenchSlug, page),
  ])

  if (!category) {
    notFound()
  }

  const totalPages = Math.ceil(total / 24)
  const icon = getCategoryIconByEnSlug(englishSlug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.label_en} in Quebec`,
    description: category.description_en,
    url: `https://registreduquebec.com/en/category/${englishSlug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Header */}
        <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white py-12 overflow-hidden">
          {/* Background Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url(/images/background/background-overlay.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="text-sm mb-4 flex items-center gap-2 text-blue-200">
              <Link href="/en" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/en/browse/categories" className="hover:text-white transition-colors">Categories</Link>
              <span>›</span>
              <span className="text-white">{category.label_en}</span>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-5xl">{icon}</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {category.label_en}
                </h1>
                <p className="mt-2 text-blue-100">
                  {total.toLocaleString('en-CA')} businesses in Quebec
                </p>
              </div>
            </div>

            {category.description_en && (
              <p className="mt-4 text-blue-100 max-w-2xl">
                {category.description_en}
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
                  const catEnSlug = toEnglishSlug(biz.main_category_slug || '')
                  const hasContact = biz.phone || biz.website

                  return (
                    <Link
                      key={biz.id}
                      href={`/en/${catEnSlug}/${citySlug}/${biz.slug}`}
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
                                ({biz.google_reviews_count} reviews)
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
                  No businesses found
                </h3>
                <p className="text-gray-500">
                  No businesses in this category at the moment.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={`/en/category/${englishSlug}?page=${page - 1}`}
                    className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 font-medium text-gray-700 border border-gray-200"
                  >
                    ← Previous
                  </Link>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Link
                        key={pageNum}
                        href={`/en/category/${englishSlug}?page=${pageNum}`}
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
                        Page {page} of {totalPages}
                      </span>
                    </>
                  )}
                </div>

                {page < totalPages && (
                  <Link
                    href={`/en/category/${englishSlug}?page=${page + 1}`}
                    className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 font-medium text-gray-700 border border-gray-200"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-blue-900 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Is your business in this category?
            </h2>
            <p className="text-blue-200 mb-6">
              Add your business to our directory for free and increase your visibility.
            </p>
            <Link
              href="/en/add-business"
              className="inline-block px-6 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Add my business
            </Link>
          </div>
        </section>
      </main>

      <FooterEN />
    </>
  )
}
