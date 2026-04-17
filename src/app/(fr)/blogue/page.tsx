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
  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <>
      <Header />

      <main className="min-h-screen" style={{ background: 'var(--background)' }}>
        {/* Hero */}
        <section className="pt-32 pb-12 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest mb-4">
              Magazine entrepreneurs
            </span>
            <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Blogue</h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              Tendances, guides pratiques et ressources pour les PME québécoises
            </p>
          </div>
        </section>

        {/* Featured hero article */}
        {featured && (
          <section className="px-4 pb-8">
            <div className="max-w-6xl mx-auto">
              <Link
                href={`/blogue/${featured.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden no-underline"
                style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-800">
                  {featured.thumbnail_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={featured.thumbnail_url}
                      alt={featured.title_fr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-bold uppercase tracking-wider">
                    À la une
                  </span>
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-12">
                  <time className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--foreground-muted)' }}>
                    {new Date(featured.published_at).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight" style={{ color: 'var(--foreground)' }}>
                    {featured.title_fr}
                  </h2>
                  {featured.excerpt_fr && (
                    <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                      {featured.excerpt_fr}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-lg bg-sky-500 text-white text-sm font-semibold group-hover:bg-sky-400 transition-colors">
                    Lire l&apos;article →
                  </span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Grid of remaining articles */}
        <section className="pb-20 px-4 pt-4">
          <div className="max-w-6xl mx-auto">
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/blogue/${article.slug}`}
                    className="group relative rounded-xl overflow-hidden no-underline block aspect-[4/5] transition-transform hover:scale-[1.02]"
                  >
                    {article.thumbnail_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={article.thumbnail_url}
                        alt={article.title_fr}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                    {/* Content overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                      <time className="text-xs uppercase tracking-widest mb-2 text-sky-400 font-semibold">
                        {new Date(article.published_at).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>
                      <h3 className="text-lg font-bold mb-4 leading-tight text-white line-clamp-3">
                        {article.title_fr}
                      </h3>
                      <span className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white text-sm font-semibold border border-white/20 group-hover:bg-sky-500 group-hover:border-sky-500 transition-all">
                        Lire →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {articles.length === 0 && (
              <div className="text-center py-16 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
                  Aucun article pour le moment. Revenez bientôt!
                </p>
              </div>
            )}

            <div className="mt-16 rounded-2xl p-10 text-center" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                Vous avez des questions?
              </h3>
              <p className="mb-5 max-w-xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
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
