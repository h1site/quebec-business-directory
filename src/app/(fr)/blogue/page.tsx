import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 3600 // 1 hour

export const metadata: Metadata = {
  title: 'Blogue — Guides pour entreprises',
  description: 'Conseils, guides et ressources pour les entreprises québécoises. Subventions, financement, marketing et plus.',
}

async function getArticles() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_articles')
    .select('slug, title_fr, excerpt_fr, thumbnail_url, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  return data || []
}

export default async function BlogPage() {
  const articles = await getArticles()

  return (
    <>
      <Header />

      <main className="min-h-screen" style={{ background: 'var(--background)' }}>
        {/* Hero */}
        <section className="pt-32 pb-16 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Blogue</h1>
            <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
              Guides et ressources pour les entreprises québécoises
            </p>
          </div>
        </section>

        {/* Grid of all articles */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/blogue/${article.slug}`}
                    className="group flex flex-col rounded-xl overflow-hidden transition-transform hover:scale-[1.02] no-underline"
                    style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {article.thumbnail_url && (
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.thumbnail_url}
                          alt={article.title_fr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 p-5">
                      <h2 className="text-lg font-bold mb-3 leading-snug" style={{ color: 'var(--foreground)' }}>
                        {article.title_fr}
                      </h2>
                      <span className="mt-auto inline-flex items-center gap-2 self-start px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold group-hover:bg-sky-400 transition-colors">
                        Lire l&apos;article →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
                  Aucun article pour le moment. Revenez bientôt!
                </p>
              </div>
            )}

            <div className="mt-12 rounded-xl p-8 text-center" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Vous avez des questions?
              </h3>
              <p className="mb-4" style={{ color: 'var(--foreground-muted)' }}>
                Contactez-nous pour toute question sur les entreprises québécoises.
              </p>
              <a
                href="mailto:info@h1site.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-400 transition-colors"
              >
                ✉️ info@h1site.com
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
