import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ARTICLES, getArticle } from '@/lib/articles'

export const dynamicParams = false

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return { title: 'Article introuvable' }
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blogue/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      locale: 'fr_CA',
      url: `https://registreduquebec.com/blogue/${slug}`,
      publishedTime: article.date,
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: 'fr-CA',
    author: { '@type': 'Organization', name: 'Registre du Québec' },
    publisher: { '@type': 'Organization', name: 'Registre du Québec' },
  }

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-sm text-zinc-500 mb-6">
        <Link href="/" className="hover:text-zinc-900">
          Accueil
        </Link>{' '}
        <span>›</span> <span>Guides</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
        {article.title}
      </h1>
      <p className="mt-3 text-sm text-zinc-500">{article.readingMinutes} min de lecture</p>
      <div
        className="article-content mt-8"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />
      <div className="mt-12 pt-8 border-t border-zinc-200">
        <Link href="/" className="text-blue-700 font-medium">
          ← Tous les guides
        </Link>
      </div>
    </article>
  )
}
