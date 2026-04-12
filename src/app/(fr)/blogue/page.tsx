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

      <main className="min-h-screen pt-24 pb-16" style={{ background: 'var(--background)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Blogue</h1>
            <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
              Guides et ressources pour les entreprises québécoises
            </p>
          </div>

          {articles.length > 0 ? (
            <div className="space-y-6">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blogue/${article.slug}`}
                  className="block rounded-xl p-6 hover:scale-[1.01] transition-transform no-underline"
                  style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <time className="text-sm mb-2 block" style={{ color: 'var(--foreground-muted)' }}>
                    {new Date(article.published_at).toLocaleDateString('fr-CA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                    {article.title_fr}
                  </h2>
                  {article.excerpt_fr && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                      {article.excerpt_fr}
                    </p>
                  )}
                  <span className="inline-block mt-3 text-sky-400 text-sm font-medium">
                    Lire l&apos;article →
                  </span>
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

          {/* Articles vedettes */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Articles vedettes</h2>
            <Link
              href="/histoire-pme-quebec"
              className="block rounded-xl p-6 hover:scale-[1.01] transition-transform no-underline mb-6"
              style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="text-xs font-medium text-sky-400 mb-2 block">Article</span>
              <span className="text-lg font-bold block mb-2" style={{ color: 'var(--foreground)' }}>
                Histoire des PME au Québec — Des origines à aujourd&apos;hui
              </span>
              <span className="text-sm block" style={{ color: 'var(--foreground-muted)' }}>
                De la traite des fourrures en Nouvelle-France aux startups technologiques de Montréal. 400 ans d&apos;entrepreneuriat québécois.
              </span>
              <span className="inline-block mt-3 text-sky-400 text-sm font-medium">Lire l&apos;article →</span>
            </Link>
          </div>

          <div className="mt-8 rounded-xl p-8 text-center" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
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
      </main>

      <Footer />
    </>
  )
}
