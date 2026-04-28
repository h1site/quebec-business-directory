import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServiceClient } from '@/lib/supabase/server'
import { REGIONS } from '@/lib/regions'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Entreprises par région du Québec',
  description: 'Parcourez les entreprises québécoises par région administrative : Montréal, Capitale-Nationale, Montérégie, Laval, et toutes les régions du Québec.',
  alternates: {
    canonical: 'https://registreduquebec.com/region',
  },
}

async function getCounts(): Promise<Record<string, number>> {
  const supabase = createServiceClient()
  const counts: Record<string, number> = {}
  REGIONS.forEach(r => { counts[r.slug] = 0 })

  // Single paginated scan over all high-conf rows (Supabase row limit = 1000)
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('businesses')
      .select('region')
      .eq('verification_confidence', 'high')
      .not('region', 'is', null)
      .range(from, from + PAGE - 1)
    if (error || !data || data.length === 0) break

    data.forEach(b => {
      if (!b.region) return
      const region = REGIONS.find(r => r.variants.includes(b.region as string))
      if (region) counts[region.slug]++
    })

    if (data.length < PAGE) break
    from += PAGE
  }
  return counts
}

export default async function RegionsIndexPage() {
  const counts = await getCounts()

  return (
    <>
      <Header />

      <main className="min-h-screen" style={{ background: 'var(--background)' }}>
        <section className="pt-32 pb-12 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest mb-4">
              17 régions du Québec
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Entreprises par région
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              Parcourez les entreprises québécoises selon leur région administrative.
            </p>
          </div>
        </section>

        <section className="pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {REGIONS.map(r => (
                <Link
                  key={r.slug}
                  href={`/region/${r.slug}`}
                  className="block rounded-xl p-5 no-underline transition-transform hover:scale-[1.02]"
                  style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <h2 className="font-bold mb-1" style={{ color: 'var(--foreground)' }}>{r.name}</h2>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    {counts[r.slug]?.toLocaleString('fr-CA') || 0} entreprises
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
