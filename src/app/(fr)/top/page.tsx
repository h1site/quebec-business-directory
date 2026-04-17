import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Palmarès — Top entreprises par ville et catégorie',
  description: 'Découvrez les meilleures entreprises du Québec classées par ville et catégorie. Top 10 des restaurants, cliniques, cabinets, et plus.',
  alternates: {
    canonical: 'https://registreduquebec.com/top',
  },
}

interface TopPage {
  slug: string
  title_fr: string
  excerpt_fr: string | null
  city: string
  category_slug: string
}

async function getPages(): Promise<TopPage[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('top_pages')
    .select('slug, title_fr, excerpt_fr, city, category_slug')
    .eq('is_published', true)
    .order('city')
    .order('category_slug')
  return (data || []) as TopPage[]
}

export default async function TopIndexPage() {
  const pages = await getPages()

  const grouped = pages.reduce<Record<string, TopPage[]>>((acc, p) => {
    acc[p.city] = acc[p.city] || []
    acc[p.city].push(p)
    return acc
  }, {})

  return (
    <>
      <Header />

      <main className="min-h-screen" style={{ background: 'var(--background)' }}>
        <section className="pt-32 pb-12 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest mb-4">
              Palmarès
            </span>
            <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Top entreprises du Québec
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              Notre sélection des meilleures entreprises par ville et catégorie, basée sur les notes Google et l&apos;expérience client.
            </p>
          </div>
        </section>

        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            {Object.entries(grouped).map(([city, cityPages]) => (
              <div key={city}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>{city}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cityPages.map(p => (
                    <Link
                      key={p.slug}
                      href={`/top/${p.slug}`}
                      className="block rounded-xl p-5 no-underline transition-transform hover:scale-[1.02]"
                      style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <h3 className="font-bold mb-2 leading-snug" style={{ color: 'var(--foreground)' }}>
                        {p.title_fr}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-sm text-sky-400 font-medium">
                        Voir le palmarès →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {pages.length === 0 && (
              <div className="text-center py-16 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
                  Aucun palmarès pour le moment.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
