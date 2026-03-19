import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Plan du site',
  description: 'Plan du site complet du Registre des entreprises du Québec. Accédez facilement à toutes les pages, catégories, villes et entreprises.',
}

export const revalidate = 86400 // Revalidate every 24 hours

async function getCategories() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name')
  return data || []
}

async function getCities() {
  const supabase = createServiceClient()
  // TODO: Replace with RPC function for better performance (SELECT DISTINCT city)
  const { data } = await supabase
    .from('businesses')
    .select('city')
    .not('city', 'is', null)
    .limit(500) // Reduced from 1000

  // Get unique cities
  const uniqueCities = [...new Set(data?.map(b => b.city).filter(Boolean))]
    .sort()
    .slice(0, 100) // Top 100 cities

  return uniqueCities
}

async function getRegions() {
  const supabase = createServiceClient()
  // TODO: Replace with RPC function for better performance (SELECT DISTINCT region)
  const { data } = await supabase
    .from('businesses')
    .select('region')
    .not('region', 'is', null)
    .limit(300) // Reduced from 1000 (fewer unique regions than cities)

  const uniqueRegions = [...new Set(data?.map(b => b.region).filter(Boolean))].sort()
  return uniqueRegions
}

async function getPopularBusinesses() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('name, slug, city')
    .not('slug', 'is', null)
    .not('ai_enriched_at', 'is', null)
    .not('google_rating', 'is', null)
    .gte('google_rating', 4.5)
    .order('google_reviews_count', { ascending: false })
    .limit(50)
  return data || []
}

async function getEnrichedBusinesses() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('name, slug, city')
    .not('slug', 'is', null)
    .not('ai_description', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(50)
  return data || []
}

export default async function SitemapPage() {
  const [categories, cities, regions, popularBusinesses, enrichedBusinesses] = await Promise.all([
    getCategories(),
    getCities(),
    getRegions(),
    getPopularBusinesses(),
    getEnrichedBusinesses(),
  ])

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-950 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Plan du site</h1>
            <p className="text-xl text-slate-400">
              Naviguez facilement à travers tout le contenu du Registre des entreprises du Québec
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Pages principales */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
                <span>📄</span> Pages principales
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/recherche" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Recherche
                  </Link>
                </li>
                <li>
                  <Link href="/parcourir/categories" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Parcourir les catégories
                  </Link>
                </li>
                <li>
                  <Link href="/blogue" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Blogue
                  </Link>
                </li>
                <li>
                  <Link href="/entreprise/nouvelle" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Ajouter une entreprise
                  </Link>
                </li>
              </ul>
            </div>

            {/* Informations */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
                <span>ℹ️</span> Informations
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/a-propos" className="text-slate-300 hover:text-sky-400 transition-colors">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-slate-300 hover:text-sky-400 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/mentions-legales" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/politique-confidentialite" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>

            {/* Compte */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
                <span>👤</span> Mon compte
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/connexion" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link href="/inscription" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Inscription
                  </Link>
                </li>
                <li>
                  <Link href="/tableau-de-bord" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Tableau de bord
                  </Link>
                </li>
              </ul>
            </div>

            {/* Catégories */}
            <div className="glass rounded-2xl p-6 md:col-span-2 lg:col-span-1">
              <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
                <span>📁</span> Catégories ({categories.length})
              </h2>
              <ul className="space-y-1 max-h-96 overflow-y-auto">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/categorie/${cat.slug}`}
                      className="text-slate-300 hover:text-sky-400 transition-colors text-sm"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Régions */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
                <span>🗺️</span> Régions ({regions.length})
              </h2>
              <ul className="space-y-1">
                {regions.map((region) => (
                  <li key={region}>
                    <Link
                      href={`/recherche?region=${encodeURIComponent(region)}`}
                      className="text-slate-300 hover:text-sky-400 transition-colors text-sm"
                    >
                      {region}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Villes populaires */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
                <span>🏙️</span> Villes populaires
              </h2>
              <ul className="space-y-1 max-h-96 overflow-y-auto">
                {cities.slice(0, 50).map((city) => (
                  <li key={city}>
                    <Link
                      href={`/ville/${city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                      className="text-slate-300 hover:text-sky-400 transition-colors text-sm"
                    >
                      {city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Entreprises enrichies */}
            <div className="glass rounded-2xl p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
                <span>⭐</span> Entreprises en vedette
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-96 overflow-y-auto">
                {enrichedBusinesses.map((biz) => (
                  <li key={biz.slug}>
                    <Link
                      href={`/entreprise/${biz.slug}`}
                      className="text-slate-300 hover:text-sky-400 transition-colors text-sm"
                    >
                      {biz.name}
                      {biz.city && <span className="text-slate-500 text-xs ml-1">({biz.city})</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Entreprises populaires */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
                <span>🏆</span> Meilleures évaluations
              </h2>
              <ul className="space-y-1 max-h-96 overflow-y-auto">
                {popularBusinesses.map((biz) => (
                  <li key={biz.slug}>
                    <Link
                      href={`/entreprise/${biz.slug}`}
                      className="text-slate-300 hover:text-sky-400 transition-colors text-sm"
                    >
                      {biz.name}
                      {biz.city && <span className="text-slate-500 text-xs ml-1">({biz.city})</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sitemaps XML */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
                <span>🔗</span> Sitemaps XML
              </h2>
              <ul className="space-y-2">
                <li>
                  <a href="/sitemap-index.xml" target="_blank" rel="noopener" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Sitemap Index
                  </a>
                </li>
                <li>
                  <a href="/sitemap-static.xml" target="_blank" rel="noopener" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Pages statiques
                  </a>
                </li>
                <li>
                  <a href="/sitemap-websites.xml" target="_blank" rel="noopener" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Entreprises
                  </a>
                </li>
              </ul>
            </div>

            {/* English */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
                <span>🌐</span> English Version
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/en" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Home (English)
                  </Link>
                </li>
                <li>
                  <Link href="/en/search" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Search
                  </Link>
                </li>
                <li>
                  <Link href="/en/about" className="text-slate-300 hover:text-sky-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/en/contact" className="text-slate-300 hover:text-sky-400 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/en/faq" className="text-slate-300 hover:text-sky-400 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 glass rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Le Registre en chiffres</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-sky-400">46 000+</div>
                <div className="text-slate-400">Entreprises</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sky-400">{categories.length}</div>
                <div className="text-slate-400">Catégories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sky-400">{regions.length}</div>
                <div className="text-slate-400">Régions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sky-400">100%</div>
                <div className="text-slate-400">Gratuit</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
