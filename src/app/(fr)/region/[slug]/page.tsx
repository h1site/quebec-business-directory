import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServiceClient } from '@/lib/supabase/server'
import { findRegion, REGIONS } from '@/lib/regions'

export const revalidate = 86400

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return REGIONS.map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const region = findRegion(slug)
  if (!region) return { title: 'Région non trouvée' }

  return {
    title: `Entreprises en ${region.name} — Annuaire`,
    description: `Découvrez les entreprises actives en ${region.name}, Québec. Coordonnées, avis Google et informations vérifiées.`,
    alternates: {
      canonical: `https://registreduquebec.com/region/${slug}`,
    },
  }
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params
  const region = findRegion(slug)
  if (!region) notFound()

  const supabase = createServiceClient()
  const { data: businesses, count } = await supabase
    .from('businesses')
    .select('slug, name, city, main_category_slug, google_rating, google_reviews_count', { count: 'exact' })
    .eq('verification_confidence', 'high')
    .in('region', region.variants)
    .not('slug', 'is', null)
    .order('google_reviews_count', { ascending: false, nullsFirst: false })
    .limit(60)

  // Group by city
  const byCity: Record<string, typeof businesses> = {}
  ;(businesses || []).forEach(b => {
    const city = b.city || 'Autres'
    byCity[city] = byCity[city] || []
    byCity[city]!.push(b)
  })
  const sortedCities = Object.entries(byCity).sort((a, b) => b[1]!.length - a[1]!.length)

  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-16" style={{ background: 'var(--background)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <nav className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
            <Link href="/" className="hover:text-sky-400" style={{ color: 'inherit' }}>Accueil</Link>
            <span className="mx-2">›</span>
            <Link href="/region" className="hover:text-sky-400" style={{ color: 'inherit' }}>Régions</Link>
            <span className="mx-2">›</span>
            <span style={{ color: 'var(--foreground)' }}>{region.name}</span>
          </nav>

          <header className="mb-10 text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest mb-4">
              Région administrative
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3" style={{ color: 'var(--foreground)' }}>
              Entreprises en {region.name}
            </h1>
            <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
              {count?.toLocaleString('fr-CA') || 0} entreprises vérifiées dans la région
            </p>
          </header>

          {sortedCities.length === 0 ? (
            <div className="text-center py-16 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
              <p style={{ color: 'var(--foreground-muted)' }}>Aucune entreprise vérifiée pour cette région pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {sortedCities.map(([city, list]) => (
                <section key={city}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{city}</h2>
                    <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{list!.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {list!.map(biz => (
                      <Link
                        key={biz.slug}
                        href={`/entreprise/${biz.slug}`}
                        className="rounded-xl p-3 transition-colors no-underline"
                        style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold truncate uppercase text-xs tracking-wide" style={{ color: 'var(--foreground)' }}>{biz.name}</h3>
                            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{biz.city}</p>
                          </div>
                          {biz.google_rating && (
                            <span className="text-amber-400 text-xs font-bold shrink-0">★ {biz.google_rating}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
