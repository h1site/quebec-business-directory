import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServiceClient } from '@/lib/supabase/server'
import { marked } from 'marked'

export const revalidate = 86400 // 24 hours

interface Props {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    return { title: 'Article non trouvé' }
  }

  return {
    title: article.title_fr,
    description: article.excerpt_fr || article.title_fr,
    openGraph: {
      title: article.title_fr,
      description: article.excerpt_fr || article.title_fr,
      type: 'article',
      locale: 'fr_CA',
      url: `https://registreduquebec.com/blogue/${slug}`,
      images: article.thumbnail_url
        ? [{ url: article.thumbnail_url }]
        : [{ url: 'https://registreduquebec.com/images/logos/logo.webp' }],
    },
    alternates: {
      canonical: `https://registreduquebec.com/blogue/${slug}`,
      languages: {
        'x-default': `/blogue/${slug}`,
        'fr-CA': `/blogue/${slug}`,
      },
    },
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title_fr,
    description: article.excerpt_fr,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      '@type': 'Organization',
      name: 'Registre du Québec',
      url: 'https://registreduquebec.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Registre du Québec',
      url: 'https://registreduquebec.com',
    },
    mainEntityOfPage: `https://registreduquebec.com/blogue/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="min-h-screen pt-24 pb-16" style={{ background: 'var(--background)' }}>
        <article className="max-w-3xl mx-auto px-4">
          <nav className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
            <Link href="/" className="hover:text-sky-400 transition-colors" style={{ color: 'inherit' }}>Accueil</Link>
            <span className="mx-2">›</span>
            <Link href="/blogue" className="hover:text-sky-400 transition-colors" style={{ color: 'inherit' }}>Blogue</Link>
            <span className="mx-2">›</span>
            <span style={{ color: 'var(--foreground)' }}>{article.title_fr}</span>
          </nav>

          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <time className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {new Date(article.published_at).toLocaleDateString('fr-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span style={{ color: 'var(--foreground-muted)' }}>·</span>
              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {Math.ceil((article.content_fr?.length || 0) / 1500)} min de lecture
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4" style={{ color: 'var(--foreground)' }}>
              {article.title_fr}
            </h1>
            {article.excerpt_fr && (
              <p className="text-lg leading-relaxed border-l-4 border-sky-500 pl-4 py-1" style={{ color: 'var(--foreground-muted)' }}>
                {article.excerpt_fr}
              </p>
            )}
            <hr className="mt-8 border-white/10" />
          </header>

          <div
            className="prose prose-invert prose-sky max-w-none
              prose-headings:text-[var(--foreground)] prose-headings:font-bold
              prose-p:text-[var(--foreground-muted)] prose-p:leading-[1.8]
              prose-a:text-sky-400 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-sky-300
              prose-li:text-[var(--foreground-muted)] prose-li:leading-[1.8]
              prose-ul:space-y-1
              prose-strong:text-[var(--foreground)] prose-strong:font-semibold
              prose-hr:border-white/10
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/10
              prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
              prose-blockquote:border-sky-500 prose-blockquote:bg-sky-500/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1"
            dangerouslySetInnerHTML={{ __html: marked.parse(article.content_fr) as string }}
          />

          <footer className="mt-12 pt-8 border-t border-white/10">
            <div className="rounded-xl p-6" style={{ background: 'var(--background-secondary)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Vous cherchez une entreprise au Québec?
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                Consultez notre annuaire de plus de 7 000 entreprises vérifiées.
              </p>
              <Link
                href="/recherche"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-400 transition-colors"
              >
                🔍 Rechercher une entreprise
              </Link>
            </div>

            <div className="mt-6 text-center">
              <Link href="/blogue" className="text-sky-400 hover:text-sky-300 font-medium">
                ← Retour au blogue
              </Link>
            </div>
          </footer>
        </article>
      </main>

      <Footer />
    </>
  )
}

