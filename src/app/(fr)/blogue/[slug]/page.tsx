import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServiceClient } from '@/lib/supabase/server'
import { marked } from 'marked'

export const revalidate = 86400 // 24 hours
export const dynamicParams = true

// Required for ISR caching with Next.js 15 — opts into static-with-fallback
export async function generateStaticParams() {
  return []
}

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

  const description = article.excerpt_fr || article.title_fr

  return {
    title: article.title_fr,
    description,
    authors: [{ name: 'Sébastien Ross', url: 'https://registreduquebec.com/a-propos' }],
    openGraph: {
      title: article.title_fr,
      description,
      type: 'article',
      locale: 'fr_CA',
      siteName: 'Registre du Québec',
      url: `https://registreduquebec.com/blogue/${slug}`,
      publishedTime: article.published_at,
      modifiedTime: article.updated_at || article.published_at,
      authors: ['https://registreduquebec.com/a-propos'],
      images: article.thumbnail_url
        ? [{ url: article.thumbnail_url, width: 1200, height: 630, alt: article.title_fr }]
        : [{ url: 'https://registreduquebec.com/images/logos/logo.webp', width: 512, height: 512, alt: 'Registre du Québec' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title_fr,
      description,
      images: article.thumbnail_url ? [article.thumbnail_url] : ['https://registreduquebec.com/images/logos/logo.webp'],
    },
    alternates: {
      canonical: `https://registreduquebec.com/blogue/${slug}`,
      languages: {
        'x-default': `/blogue/${slug}`,
        'fr-CA': `/blogue/${slug}`,
        'en-CA': `/en/blog/${slug}`,
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
    image: article.thumbnail_url
      ? [article.thumbnail_url]
      : ['https://registreduquebec.com/images/logos/logo.webp'],
    author: {
      '@type': 'Person',
      '@id': 'https://registreduquebec.com/a-propos#sebastien-ross',
      name: 'Sébastien Ross',
      url: 'https://registreduquebec.com/a-propos',
      jobTitle: 'Fondateur, Registre du Québec',
      worksFor: {
        '@type': 'Organization',
        name: 'Registre du Québec',
        url: 'https://registreduquebec.com',
      },
      sameAs: [
        'https://www.linkedin.com/in/sebastienross',
        'https://www.linkedin.com/company/registre-du-quebec',
      ],
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://registreduquebec.com/#organization',
      name: 'Registre du Québec',
      url: 'https://registreduquebec.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://registreduquebec.com/images/logos/logo.webp',
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://registreduquebec.com/blogue/${slug}`,
    },
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
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4" style={{ color: 'var(--foreground)' }}>
              {article.title_fr}
            </h1>
            {article.excerpt_fr && (
              <p className="text-lg leading-relaxed border-l-4 border-sky-500 pl-4 py-1 mb-6" style={{ color: 'var(--foreground-muted)' }}>
                {article.excerpt_fr}
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap text-sm" style={{ color: 'var(--foreground-muted)' }}>
              <span>Par <Link href="/a-propos" className="font-semibold hover:text-sky-400 transition-colors" style={{ color: 'var(--foreground)' }}>Sébastien Ross</Link>, fondateur</span>
              <span>·</span>
              <time>
                {new Date(article.published_at).toLocaleDateString('fr-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              {article.updated_at && article.updated_at !== article.published_at && (
                <>
                  <span>·</span>
                  <span>Mis à jour le {new Date(article.updated_at).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </>
              )}
              <span>·</span>
              <span>{Math.ceil((article.content_fr?.length || 0) / 1500)} min de lecture</span>
            </div>
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
            {/* Author bio - E-E-A-T signal */}
            <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9' }}>
                  SR
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--foreground-muted)' }}>À propos de l&apos;auteur</p>
                  <h3 className="font-bold mb-1" style={{ color: 'var(--foreground)' }}>Sébastien Ross</h3>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--foreground-muted)' }}>
                    Fondateur de Registre du Québec. Entrepreneur web depuis 2010, spécialisé dans la création de plateformes pour les PME québécoises.
                  </p>
                  <div className="flex gap-3 text-sm">
                    <Link href="/a-propos" className="text-sky-400 hover:text-sky-300 font-medium">À propos</Link>
                    <a href="https://www.linkedin.com/in/sebastienross" rel="nofollow noopener noreferrer" target="_blank" className="text-sky-400 hover:text-sky-300 font-medium">LinkedIn ↗</a>
                  </div>
                </div>
              </div>
            </div>

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

