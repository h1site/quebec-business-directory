import type { Metadata } from 'next'
import { formatBusinessName } from '@/lib/format-business-name'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdSense from '@/components/AdSense'
import { AD_SLOTS } from '@/config/adSlots'
import {
  HeroSection,
  CategoriesSection,
} from '@/components/home'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 86400 // 24 hours

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://registreduquebec.com',
    languages: {
      'x-default': 'https://registreduquebec.com',
      'fr-CA': 'https://registreduquebec.com',
      'en-CA': 'https://registreduquebec.com/en',
    },
  },
}

async function getFeaturedBusinesses() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('businesses')
    .select('slug, name, city, main_category_slug, google_rating')
    .eq('verification_confidence', 'high')
    .not('ai_description', 'is', null)
    .not('google_rating', 'is', null)
    .gte('google_rating', 4)
    .order('google_reviews_count', { ascending: false })
    .limit(30)
  return data || []
}

async function getBlogArticles() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('blog_articles')
    .select('slug, title_fr, thumbnail_url')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(16)
  return data || []
}

const TOTAL_BUSINESSES = 7000

// Static categories - update when categories change
const CATEGORIES = [
  { id: '1', slug: 'agriculture-et-environnement', label_fr: 'Agriculture et environnement' },
  { id: '2', slug: 'arts-medias-et-divertissement', label_fr: 'Arts, médias et divertissement' },
  { id: '3', slug: 'automobile-et-transport', label_fr: 'Automobile et transport' },
  { id: '4', slug: 'commerce-de-detail', label_fr: 'Commerce de détail' },
  { id: '5', slug: 'construction-et-renovation', label_fr: 'Construction et rénovation' },
  { id: '6', slug: 'education-et-formation', label_fr: 'Éducation et formation' },
  { id: '7', slug: 'finance-assurance-et-juridique', label_fr: 'Finance, assurance et juridique' },
  { id: '8', slug: 'immobilier', label_fr: 'Immobilier' },
  { id: '9', slug: 'industrie-fabrication-et-logistique', label_fr: 'Industrie, fabrication et logistique' },
  { id: '10', slug: 'maison-et-services-domestiques', label_fr: 'Maison et services domestiques' },
  { id: '11', slug: 'organismes-publics-et-communautaires', label_fr: 'Organismes publics et communautaires' },
  { id: '12', slug: 'restauration-et-alimentation', label_fr: 'Restauration et alimentation' },
  { id: '13', slug: 'sante-et-bien-etre', label_fr: 'Santé et bien-être' },
  { id: '14', slug: 'services-funeraires', label_fr: 'Services funéraires' },
  { id: '15', slug: 'services-professionnels', label_fr: 'Services professionnels' },
  { id: '16', slug: 'soins-a-domicile', label_fr: 'Soins à domicile' },
  { id: '17', slug: 'sports-et-loisirs', label_fr: 'Sports et loisirs' },
  { id: '18', slug: 'technologie-et-informatique', label_fr: 'Technologie et informatique' },
  { id: '19', slug: 'tourisme-et-hebergement', label_fr: 'Tourisme et hébergement' },
]

export default async function HomePage() {
  const featuredBusinesses = await getFeaturedBusinesses()
  const blogArticles = await getBlogArticles()

  const faqItems = [
    { q: 'Comment trouver une entreprise sur Registre du Québec ?', a: 'Utilisez la barre de recherche en haut de la page d\'accueil. Vous pouvez chercher par nom d\'entreprise, par catégorie (restaurant, plombier, avocat, etc.) ou par ville (Montréal, Québec, Laval, Longueuil, Gatineau et plus). Les résultats incluent les coordonnées complètes, les avis Google et les informations vérifiées.' },
    { q: 'Combien d\'entreprises sont répertoriées dans le Registre du Québec ?', a: 'Notre annuaire contient plus de 7 000 fiches d\'entreprises québécoises vérifiées avec un haut niveau de confiance, couvrant toutes les régions de la province et plus de 19 catégories d\'activités professionnelles.' },
    { q: 'Comment ajouter ou réclamer ma fiche d\'entreprise ?', a: 'Si votre entreprise n\'est pas encore listée, cliquez sur "Ajouter mon entreprise" depuis la page d\'accueil pour créer votre fiche gratuitement. Si elle existe déjà mais n\'est pas réclamée, accédez à la fiche et utilisez le bouton "Réclamer cette fiche".' },
    { q: 'L\'inscription au Registre du Québec est-elle payante ?', a: 'Non. L\'ajout et la réclamation de votre fiche sont entièrement gratuits. Aucuns frais cachés, aucun abonnement requis.' },
    { q: 'Les informations sur les fiches sont-elles fiables ?', a: 'Oui. Chaque fiche affichée publiquement a un niveau de confiance élevé et combine des données de plusieurs sources : Google, registres officiels, sites web d\'entreprises et vérifications automatisées.' },
    { q: 'Puis-je laisser un avis sur une entreprise ?', a: 'Nous affichons les avis Google authentiques des entreprises. Pour partager votre expérience, vous pouvez le faire directement sur Google Maps, et l\'avis sera reflété sur la fiche de l\'entreprise après mise à jour.' },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        '@id': 'https://registreduquebec.com/#faq',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
      {
        '@type': 'WebSite',
        '@id': 'https://registreduquebec.com/#website',
        url: 'https://registreduquebec.com',
        name: 'Registre du Québec',
        description: 'Annuaire de plus de 7 000 entreprises québécoises vérifiées.',
        publisher: { '@id': 'https://registreduquebec.com/#organization' },
        inLanguage: 'fr-CA',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://registreduquebec.com/recherche?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://registreduquebec.com/#organization',
        name: 'Registre du Québec',
        alternateName: 'Registre des entreprises du Québec',
        url: 'https://registreduquebec.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://registreduquebec.com/images/logos/logo.webp',
          width: 512,
          height: 512,
        },
        foundingDate: '2025',
        founder: {
          '@type': 'Person',
          name: 'Sébastien Ross',
        },
        sameAs: [
          'https://www.facebook.com/registreduquebec/',
          'https://www.linkedin.com/company/registre-du-quebec',
          'https://www.facebook.com/groups/registreduquebec',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'info@h1site.com',
          contactType: 'Customer Service',
          availableLanguage: ['French', 'English'],
          areaServed: 'CA',
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Vaudreuil-Dorion',
          addressRegion: 'QC',
          addressCountry: 'CA',
        },
        knowsAbout: [
          'Entreprises du Québec',
          'Annuaire professionnel',
          'Immatriculation d\'entreprise',
          'PME québécoises',
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main>
        <HeroSection totalBusinesses={TOTAL_BUSINESSES} />

        {/* Blog articles grid - right after hero */}
        {blogArticles.length > 0 && (
          <section className="py-[100px] px-4" style={{ background: 'var(--background)' }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                  Guides et articles pour entrepreneurs
                </h2>
                <p style={{ color: 'var(--foreground-muted)' }}>
                  Conseils, tendances et ressources pour les PME québécoises
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {blogArticles.map((article) => (
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
                    <div className="flex flex-col flex-1 p-4">
                      <h3 className="text-sm font-bold mb-3 leading-snug line-clamp-3" style={{ color: 'var(--foreground)' }}>
                        {article.title_fr}
                      </h3>
                      <span className="mt-auto inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-semibold group-hover:bg-sky-400 transition-colors">
                        Lire →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link
                  href="/blogue"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-400 transition-colors no-underline"
                >
                  Voir tous les articles →
                </Link>
              </div>
            </div>
          </section>
        )}

        <CategoriesSection categories={CATEGORIES} />

        {/* Ad - after categories + cities (eager: typically visible after first scroll) */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdSense slot={AD_SLOTS.leaderboard} format="auto" responsive={true} eager />
        </div>

        {/* Featured Businesses - critical for Google crawling internal links */}
        {featuredBusinesses.length > 0 && (
          <section className="py-[100px] relative" style={{ background: 'var(--background-secondary)' }}>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'url(/images/background/background-overlay.png)',
                backgroundAttachment: 'fixed',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                opacity: 0.05,
              }}
            />
            <div className="relative z-10 max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Entreprises populaires au Québec</h2>
              <p className="text-slate-400 text-center mb-8">Découvrez les entreprises les mieux notées par leurs clients</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredBusinesses.map((biz) => (
                  <Link
                    key={biz.slug}
                    href={`/entreprise/${biz.slug}`}
                    className="glass rounded-xl p-3 hover:bg-white/10 transition-all no-underline"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white truncate uppercase text-xs tracking-wide">{formatBusinessName(biz.name)}</h3>
                        <p className="text-slate-400 text-xs">{biz.city}</p>
                      </div>
                      {biz.google_rating && (
                        <span className="text-amber-400 text-xs font-bold shrink-0 ml-2">★ {biz.google_rating}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About / value-prop content section - boosts text-to-HTML ratio */}
        <section className="py-[100px] px-4" style={{ background: 'var(--background)' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center" style={{ color: 'var(--foreground)' }}>
              Le plus grand annuaire d&apos;entreprises québécoises vérifiées
            </h2>

            <div className="space-y-6 text-base md:text-lg leading-[1.8]" style={{ color: 'var(--foreground-muted)' }}>
              <p>
                <strong style={{ color: 'var(--foreground)' }}>Registre du Québec</strong> est l&apos;annuaire de référence pour découvrir les entreprises actives au Québec. Notre plateforme regroupe plus de 7 000 fiches vérifiées d&apos;entreprises, commerces, professionnels et services partout dans la province : Montréal, Québec, Laval, Longueuil, Gatineau, Sherbrooke, Trois-Rivières, Saguenay et toutes les régions du Québec.
              </p>
              <p>
                Que vous cherchiez un <Link href="/categorie/restauration-et-alimentation" className="text-sky-400 hover:text-sky-300 underline">restaurant à Montréal</Link>, un <Link href="/categorie/construction-et-renovation" className="text-sky-400 hover:text-sky-300 underline">entrepreneur en construction</Link>, un <Link href="/categorie/sante-et-bien-etre" className="text-sky-400 hover:text-sky-300 underline">professionnel de la santé</Link>, ou un <Link href="/categorie/services-professionnels" className="text-sky-400 hover:text-sky-300 underline">service professionnel</Link>, notre annuaire vous aide à trouver rapidement des entreprises locales fiables. Chaque fiche affiche les coordonnées, les avis Google authentiques, les heures d&apos;ouverture, l&apos;adresse exacte et la catégorie d&apos;activité.
              </p>
              <p>
                <strong style={{ color: 'var(--foreground)' }}>Pourquoi consulter notre registre ?</strong> Parce que nos données sont mises à jour régulièrement et croisées avec plusieurs sources fiables. Contrairement à d&apos;autres annuaires généralistes, nous nous concentrons exclusivement sur le Québec et privilégions la qualité des informations à la quantité brute. Les propriétaires d&apos;entreprises peuvent réclamer leur fiche gratuitement pour la maintenir à jour, répondre aux avis et augmenter leur visibilité auprès des consommateurs québécois.
              </p>
              <p>
                <strong style={{ color: 'var(--foreground)' }}>Pour les entrepreneurs :</strong> ajoutez gratuitement votre entreprise et profitez d&apos;une visibilité organique sans frais cachés. Notre <Link href="/blogue" className="text-sky-400 hover:text-sky-300 underline">blogue</Link> publie également des guides pratiques sur l&apos;immatriculation, le financement, les subventions, le repreneuriat et les tendances entrepreneuriales au Québec en 2026.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ - boosts text content + structured data */}
        <section className="py-[80px] px-4" style={{ background: 'var(--background-secondary)' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center" style={{ color: 'var(--foreground)' }}>
              Questions fréquentes
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'Comment trouver une entreprise sur Registre du Québec ?',
                  a: 'Utilisez la barre de recherche en haut de la page d\'accueil. Vous pouvez chercher par nom d\'entreprise, par catégorie (restaurant, plombier, avocat, etc.) ou par ville (Montréal, Québec, Laval, Longueuil, Gatineau et plus). Les résultats incluent les coordonnées complètes, les avis Google et les informations vérifiées.',
                },
                {
                  q: 'Combien d\'entreprises sont répertoriées dans le Registre du Québec ?',
                  a: 'Notre annuaire contient plus de 7 000 fiches d\'entreprises québécoises vérifiées avec un haut niveau de confiance, couvrant toutes les régions de la province et plus de 19 catégories d\'activités professionnelles.',
                },
                {
                  q: 'Comment ajouter ou réclamer ma fiche d\'entreprise ?',
                  a: 'Si votre entreprise n\'est pas encore listée, cliquez sur "Ajouter mon entreprise" depuis la page d\'accueil pour créer votre fiche gratuitement. Si elle existe déjà mais n\'est pas réclamée, accédez à la fiche et utilisez le bouton "Réclamer cette fiche". Le processus prend quelques minutes.',
                },
                {
                  q: 'L\'inscription au Registre du Québec est-elle payante ?',
                  a: 'Non. L\'ajout et la réclamation de votre fiche sont entièrement gratuits. Aucuns frais cachés, aucun abonnement requis. Notre objectif est d\'offrir une visibilité maximale aux entreprises québécoises.',
                },
                {
                  q: 'Les informations sur les fiches sont-elles fiables ?',
                  a: 'Oui. Chaque fiche affichée publiquement a un niveau de confiance "élevé" et combine des données de plusieurs sources : Google, registres officiels, sites web d\'entreprises et vérifications automatisées. Les fiches réclamées par leurs propriétaires sont mises à jour en temps réel.',
                },
                {
                  q: 'Puis-je laisser un avis sur une entreprise ?',
                  a: 'Pour le moment, nous affichons les avis Google authentiques des entreprises. Pour partager votre expérience, vous pouvez le faire directement sur Google Maps, et l\'avis sera reflété sur la fiche de l\'entreprise après mise à jour.',
                },
              ].map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl p-5 transition-colors"
                  style={{ background: 'var(--background)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <summary className="flex items-center justify-between cursor-pointer font-semibold list-none" style={{ color: 'var(--foreground)' }}>
                    <span>{item.q}</span>
                    <span className="text-sky-400 text-xl shrink-0 ml-4 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 leading-[1.8]" style={{ color: 'var(--foreground-muted)' }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Ad - Multiplex (related-content style) at end of page */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <AdSense slot={AD_SLOTS.multiplex} format="autorelaxed" responsive={true} style={{ minHeight: '300px' }} />
        </div>

      </main>

      <Footer />
    </>
  )
}
