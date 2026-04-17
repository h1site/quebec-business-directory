import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServiceClient } from '@/lib/supabase/server'
import { marked } from 'marked'

export const revalidate = 86400

interface Props {
  params: Promise<{ slug: string }>
}

interface TopPage {
  slug: string
  city: string
  category_slug: string
  title_fr: string
  title_en: string | null
  excerpt_fr: string | null
  excerpt_en: string | null
  intro_fr: string
  intro_en: string | null
  criteria_fr: string | null
  criteria_en: string | null
  conclusion_fr: string | null
  conclusion_en: string | null
  is_published: boolean
  published_at: string
  updated_at?: string
}

interface TopBusiness {
  slug: string
  name: string
  city: string | null
  google_rating: number | null
  google_reviews_count: number | null
  ai_description: string | null
  main_category_slug: string | null
  verified_address: string | null
  address: string | null
}

async function getPage(slug: string): Promise<TopPage | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('top_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data as TopPage | null
}

async function getTopBusinesses(city: string, categorySlug: string): Promise<TopBusiness[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('slug, name, city, google_rating, google_reviews_count, ai_description, main_category_slug, verified_address, address')
    .eq('verification_confidence', 'high')
    .eq('city', city)
    .eq('main_category_slug', categorySlug)
    .not('slug', 'is', null)
    .not('google_rating', 'is', null)
    .gte('google_rating', 3.5)
    .order('google_reviews_count', { ascending: false })
    .limit(30)

  if (!data) return []

  const scored = data
    .map(b => ({
      ...b,
      score: (b.google_rating || 0) * Math.log10((b.google_reviews_count || 0) + 10),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  return scored as TopBusiness[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return { title: 'Page non trouvée' }

  const canonical = `https://registreduquebec.com/top/${slug}`
  return {
    title: page.title_fr,
    description: page.excerpt_fr || page.title_fr,
    alternates: {
      canonical,
      languages: {
        'x-default': `/top/${slug}`,
        'fr-CA': `/top/${slug}`,
      },
    },
    openGraph: {
      title: page.title_fr,
      description: page.excerpt_fr || page.title_fr,
      type: 'article',
      locale: 'fr_CA',
      url: canonical,
    },
  }
}

export default async function TopPageRoute({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  const businesses = await getTopBusinesses(page.city, page.category_slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.title_fr,
    description: page.excerpt_fr,
    numberOfItems: businesses.length,
    itemListElement: businesses.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LocalBusiness',
        name: b.name,
        url: `https://registreduquebec.com/entreprise/${b.slug}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: b.city,
          addressRegion: 'QC',
          addressCountry: 'CA',
        },
        ...(b.google_rating && b.google_reviews_count ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: b.google_rating,
            reviewCount: b.google_reviews_count,
          },
        } : {}),
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="min-h-screen pt-24 pb-16" style={{ background: 'var(--background)' }}>
        <article className="max-w-4xl mx-auto px-4">
          <nav className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
            <Link href="/" className="hover:text-sky-400 transition-colors" style={{ color: 'inherit' }}>Accueil</Link>
            <span className="mx-2">›</span>
            <Link href="/top" className="hover:text-sky-400 transition-colors" style={{ color: 'inherit' }}>Palmarès</Link>
            <span className="mx-2">›</span>
            <span style={{ color: 'var(--foreground)' }}>{page.title_fr}</span>
          </nav>

          <header className="mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest mb-4">
              Palmarès · {page.city}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4" style={{ color: 'var(--foreground)' }}>
              {page.title_fr}
            </h1>
            {page.excerpt_fr && (
              <p className="text-lg leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                {page.excerpt_fr}
              </p>
            )}
          </header>

          {/* Intro */}
          <section
            className="prose prose-invert max-w-none mb-12
              prose-p:text-[var(--foreground-muted)] prose-p:leading-[1.8]
              prose-strong:text-[var(--foreground)] prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: marked.parse(page.intro_fr) as string }}
          />

          {/* Criteria */}
          {page.criteria_fr && (
            <section className="rounded-xl p-6 mb-12" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Nos critères de sélection
              </h2>
              <div
                className="prose prose-invert max-w-none
                  prose-p:text-[var(--foreground-muted)] prose-p:leading-[1.8]
                  prose-li:text-[var(--foreground-muted)] prose-li:leading-[1.8]
                  prose-strong:text-[var(--foreground)] prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: marked.parse(page.criteria_fr) as string }}
              />
            </section>
          )}

          {/* Top 10 list */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
              Notre sélection des 10 meilleures entreprises
            </h2>

            {businesses.length === 0 ? (
              <p style={{ color: 'var(--foreground-muted)' }}>Aucune entreprise trouvée pour ces critères.</p>
            ) : (
              <ol className="space-y-4">
                {businesses.map((biz, i) => (
                  <li key={biz.slug}>
                    <Link
                      href={`/entreprise/${biz.slug}`}
                      className="flex gap-4 rounded-xl p-5 no-underline transition-transform hover:scale-[1.01]"
                      style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9' }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: 'var(--foreground)' }}>
                            {biz.name}
                          </h3>
                          {biz.google_rating && (
                            <span className="text-amber-400 text-sm font-bold shrink-0">
                              ★ {biz.google_rating} {biz.google_reviews_count ? `(${biz.google_reviews_count})` : ''}
                            </span>
                          )}
                        </div>
                        {biz.ai_description && (
                          <p className="text-sm leading-relaxed line-clamp-3 mb-3" style={{ color: 'var(--foreground-muted)' }}>
                            {biz.ai_description}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm text-sky-400 font-medium">
                          Voir la fiche →
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Conclusion */}
          {page.conclusion_fr && (
            <section
              className="prose prose-invert max-w-none mb-12
                prose-headings:text-[var(--foreground)]
                prose-p:text-[var(--foreground-muted)] prose-p:leading-[1.8]
                prose-strong:text-[var(--foreground)] prose-strong:font-semibold"
              dangerouslySetInnerHTML={{ __html: marked.parse(page.conclusion_fr) as string }}
            />
          )}

          <footer className="mt-12 pt-8 border-t border-white/10">
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--background-secondary)' }}>
              <p className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                Découvrez plus d&apos;entreprises à {page.city}
              </p>
              <Link
                href={`/ville/${page.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-400 transition-colors"
              >
                Voir toutes les entreprises à {page.city} →
              </Link>
            </div>
          </footer>
        </article>
      </main>

      <Footer />
    </>
  )
}
