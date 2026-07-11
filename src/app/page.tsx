import Link from 'next/link'
import { ARTICLES } from '@/lib/articles'

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-5">
      <section className="py-16 sm:py-20">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900">
          Entreprendre au Québec en 2026
        </h1>
        <p className="mt-5 text-lg leading-8 text-zinc-600">
          Des guides clairs et documentés pour créer, financer et reprendre une entreprise au
          Québec — subventions, repreneuriat, financement et défis des PME.
        </p>
      </section>

      <section className="pb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6">
          Nos guides
        </h2>
        <ul className="space-y-8">
          {ARTICLES.map((a) => (
            <li key={a.slug} className="border-b border-zinc-100 pb-8 last:border-0">
              <Link href={`/blogue/${a.slug}`} className="group block no-underline">
                <h3 className="text-2xl font-semibold text-zinc-900 group-hover:text-blue-700 transition-colors">
                  {a.title}
                </h3>
                <p className="mt-2 text-zinc-600 leading-7">{a.excerpt}</p>
                <span className="mt-3 inline-block text-sm font-medium text-blue-700">
                  Lire le guide →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
