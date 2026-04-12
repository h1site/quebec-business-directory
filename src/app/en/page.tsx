import Link from 'next/link'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'
import {
  HeroSectionEN,
  CategoriesSectionEN,
  CitiesSectionEN,
  StatsSectionEN,
  AboutSectionEN,
} from '@/components/home'
import AdSense from '@/components/AdSense'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 86400 // 24 hours

async function getFeaturedBusinesses() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('slug, name, city, main_category_slug, google_rating')
    .eq('verification_confidence', 'high')
    .not('ai_description', 'is', null)
    .not('google_rating', 'is', null)
    .gte('google_rating', 4)
    .order('google_reviews_count', { ascending: false })
    .limit(30)
  return data || []
}

async function getCategories() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('main_categories')
    .select('id, slug, label_en')
    .order('label_en')
  return data || []
}

const TOTAL_BUSINESSES = 7000

export default async function HomePageEN() {
  const [featuredBusinesses, categories] = await Promise.all([
    getFeaturedBusinesses(),
    getCategories(),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Quebec Business Registry',
    url: 'https://registreduquebec.com/en',
    description: 'Easily find over 7,000 verified Quebec businesses.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://registreduquebec.com/en/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeaderEN />

      <main>
        <HeroSectionEN totalBusinesses={TOTAL_BUSINESSES} />

        {/* TeckBlaze Promo Banner */}
        <section className="py-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <a
              href="https://teckblaze.com?utm_source=registreduquebec&utm_medium=banner&utm_campaign=homepage-en"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col md:flex-row items-center gap-6 rounded-2xl p-6 md:p-8 no-underline transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(168,85,247,0.1) 100%)', border: '1px solid rgba(14,165,233,0.2)' }}
            >
              <img
                src="/images/logos/logo-teckblaze.png"
                alt="TeckBlaze - SEO Audit"
                width={80}
                height={80}
                className="rounded-xl shrink-0"
              />
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">Partner</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  SEO &amp; GEO (AI) Audit for the price of a coffee
                </h3>
                <p className="text-slate-400 text-sm mb-3">
                  75+ checks in one scan: technical SEO, Core Web Vitals, accessibility, ChatGPT &amp; Google optimization. Global score, recommendations and PDF export.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300">🔍 Technical SEO</span>
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300">🤖 GEO for AI</span>
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300">⚡ Core Web Vitals</span>
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300">♿ Accessibility</span>
                </div>
              </div>
              <div className="shrink-0 text-center">
                <span className="block text-3xl font-extrabold text-white">$1.99</span>
                <span className="block text-xs text-slate-400 mb-3">per scan · no subscription</span>
                <span className="inline-block px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg transition-colors text-sm">
                  Scan my website →
                </span>
              </div>
            </a>
          </div>
        </section>

        <CategoriesSectionEN categories={categories} />

        {/* Ad - after categories */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdSense slot="8544579045" format="auto" responsive={true} />
        </div>

        <CitiesSectionEN />
        <StatsSectionEN />

        {/* Ad - after stats */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdSense slot="8544579045" format="auto" responsive={true} />
        </div>

        {/* Featured Businesses */}
        {featuredBusinesses.length > 0 && (
          <section className="py-12" style={{ background: 'var(--background-secondary)' }}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Popular Businesses in Quebec</h2>
              <p className="text-slate-400 text-center mb-8">Discover the top-rated businesses by their customers</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredBusinesses.map((biz) => (
                  <Link
                    key={biz.slug}
                    href={`/en/company/${biz.slug}`}
                    className="glass rounded-xl p-4 hover:bg-white/10 transition-all no-underline"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white truncate">{biz.name}</h3>
                        <p className="text-slate-400 text-sm">{biz.city}</p>
                      </div>
                      {biz.google_rating && (
                        <span className="text-amber-400 text-sm font-bold shrink-0 ml-2">★ {biz.google_rating}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Ad - before about */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdSense slot="8544579045" format="auto" responsive={true} />
        </div>

        <AboutSectionEN />
      </main>

      <FooterEN />
    </>
  )
}
