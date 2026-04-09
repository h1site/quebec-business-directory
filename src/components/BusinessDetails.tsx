'use client'

import type { Business } from '@/types/business'
import Link from 'next/link'
import { generateSlug } from '@/lib/utils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { categoryLabels } from '@/lib/category-labels'
import ClaimButton from '@/components/ClaimButton'
import AdSense from '@/components/AdSense'

interface Props {
  business: Business
  cityBusinesses?: Business[]
  categoryBusinesses?: Business[]
}

const dayNames: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

function ensureProtocol(url: string): string {
  if (!/^https?:\/\//i.test(url)) return `https://${url}`
  return url
}

function addUtm(url: string): string {
  try {
    const u = new URL(ensureProtocol(url))
    u.searchParams.set('utm_source', 'registreduquebec')
    u.searchParams.set('utm_medium', 'referral')
    u.searchParams.set('utm_campaign', 'fiche-entreprise')
    return u.toString()
  } catch {
    return ensureProtocol(url)
  }
}

/* ---- Inline SVG icon components ---- */

/* ---- Lightweight icon/rating helpers using Unicode instead of SVG ---- */

const icons = {
  phone: '📞',
  email: '✉️',
  globe: '🌐',
  navigation: '🧭',
  location: '📍',
  check: '✅',
  chevron: '▼',
  facebook: 'f',
  instagram: 'IG',
  linkedin: 'in',
  star: '★',
  starEmpty: '☆',
}

function StarRating({ value }: { value: number }) {
  const full = Math.floor(value)
  const half = value % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return (
    <span className="text-amber-400 tracking-wider" aria-label={`${value} sur 5 étoiles`}>
      {'★'.repeat(full)}{half ? '⯪' : ''}{'☆'.repeat(empty)}
    </span>
  )
}

/* ---- Main component ---- */

export default function BusinessDetails({ business, cityBusinesses = [] }: Props) {
  const citySlug = generateSlug(business.city || '')

  const displayAddress = business.verified_address || null
  const displayPhone = business.verified_phone || null
  const displayEmail = business.verified_email || null
  const displayCity = business.verified_city || business.city
  const displayPostalCode = business.verified_postal_code || business.postal_code

  const hasContactInfo = displayPhone || displayEmail || business.website || displayAddress
  const hasSocialMedia = business.facebook_url || business.instagram_url || business.linkedin_url
  const hasOpeningHours = business.opening_hours && Object.keys(business.opening_hours).length > 0
  const seo = (business as any).ai_seo_content as { intro?: string; analysis?: string; local_context?: string; reputation_text?: string; score_popularity?: number; score_services?: number; score_accessibility?: number } | null

  return (
    <>
      <Header />

      <main className="min-h-screen pt-16" style={{ background: 'var(--background)' }}>
        {/* Hero Section */}
        <section className="relative py-8 overflow-hidden" style={{ background: 'var(--background)' }}>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="text-sm mb-3 flex items-center gap-1 flex-wrap" style={{ color: 'var(--foreground-muted)' }}>
              <Link href="/" className="hover:text-sky-400 transition-colors" style={{ color: 'inherit' }}>Accueil</Link>
              <span>&rsaquo;</span>
              <Link href="/recherche" className="hover:text-sky-400 transition-colors" style={{ color: 'inherit' }}>Entreprises</Link>
              <span>&rsaquo;</span>
              <Link href={`/ville/${citySlug}`} className="hover:text-sky-400 transition-colors" style={{ color: 'inherit' }}>{business.city}</Link>
              <span>&rsaquo;</span>
              <span style={{ color: 'var(--foreground)' }}>{business.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              <div className="w-32 h-32 rounded-xl p-1 flex-shrink-0 border border-white/10" style={{ background: 'var(--background-secondary)' }}>
                <img
                  src={business.logo_url || '/images/logos/logo.webp'}
                  alt={business.logo_url
                    ? `Logo de ${business.name}`
                    : `${business.name} - Entreprise enregistrée au Registre du Québec à ${business.city || 'Québec'}`}
                  width={128}
                  height={128}
                  className={`w-full h-full object-contain ${!business.logo_url ? 'brightness-0 invert dark:brightness-0 dark:invert' : ''}`}
                />
              </div>

              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                  {business.name}
                  {business.main_category_slug && business.city && (
                    <span className="block text-lg md:text-xl font-medium mt-1" style={{ color: 'var(--foreground-muted)' }}>
                      {categoryLabels[business.main_category_slug] || business.main_category_slug} à {business.city}
                    </span>
                  )}
                  {business.main_category_slug && !business.city && (
                    <span className="block text-lg md:text-xl font-medium mt-1" style={{ color: 'var(--foreground-muted)' }}>
                      {categoryLabels[business.main_category_slug] || business.main_category_slug} au Québec
                    </span>
                  )}
                  {!business.main_category_slug && business.city && (
                    <span className="block text-lg md:text-xl font-medium mt-1" style={{ color: 'var(--foreground-muted)' }}>
                      Entreprise à {business.city}
                    </span>
                  )}
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border border-white/10" style={{ color: 'var(--foreground-muted)' }}>
                    📍
                    {business.city}, {business.region || 'Québec'}
                  </span>

                  {business.google_rating && (
                    <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10">
                      <span className="text-amber-400">★</span>
                      <span className="font-bold" style={{ color: 'var(--foreground)' }}>{business.google_rating}</span>
                      {business.google_reviews_count > 0 && (
                        <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>({business.google_reviews_count} avis)</span>
                      )}
                    </span>
                  )}

                  {business.main_category_slug && (
                    <Link
                      href={`/categorie/${business.main_category_slug}`}
                      className="inline-flex items-center text-sm px-3 py-1 rounded-full border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 transition-colors"
                    >
                      {categoryLabels[business.main_category_slug] || business.main_category_slug}
                    </Link>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {displayPhone && (
                    <a
                      href={`tel:${displayPhone}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-500 transition-colors"
                    >
                      📞
                      Appeler
                    </a>
                  )}
                  {displayEmail && (
                    <a
                      href={`mailto:${displayEmail}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 transition-colors"
                    >
                      ✉️
                      Courriel
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={addUtm(business.website)}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 transition-colors"
                    >
                      🌐
                      Site web
                    </a>
                  )}
                  {(business.latitude && business.longitude) && (
                    <a
                      href={`https://waze.com/ul?ll=${business.latitude},${business.longitude}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black bg-[#33ccff] hover:bg-[#00b8f5] transition-colors"
                    >
                      🧭
                      Itin&eacute;raire
                    </a>
                  )}
                  <ClaimButton
                    businessId={business.id}
                    businessSlug={business.slug}
                    isClaimed={business.is_claimed}
                    claimStatus={business.claim_status}
                    ownerIdExists={!!business.owner_id}
                    inline
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8" style={{ background: 'var(--background-secondary)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Intro unique (SEO) */}
                {seo?.intro && (
                  <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                    <p className="leading-relaxed text-[15px]" style={{ color: 'var(--foreground-muted)' }}>
                      {seo.intro}
                    </p>
                  </div>
                )}

                {/* About */}
                <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                  <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>À propos</h2>
                  {business.ai_description ? (
                    <p className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                      {business.ai_description}
                    </p>
                  ) : business.description ? (
                    <p className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                      {business.description}
                    </p>
                  ) : (
                    <p className="italic" style={{ color: 'var(--foreground-muted)' }}>
                      Aucune description disponible pour cette entreprise.
                    </p>
                  )}

                  {business.ai_services && business.ai_services.length > 0 && (
                    <>
                      <hr className="my-6 border-white/10" />
                      <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Services</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {business.ai_services.map((service, i) => (
                          <li key={i} className="flex items-center gap-2">
                            ✅
                            <span style={{ color: 'var(--foreground-muted)' }}>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {!business.ai_services && business.products_services && (
                    <>
                      <hr className="my-6 border-white/10" />
                      <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Produits et services</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {business.products_services.split('\n').filter(Boolean).map((service, i) => (
                          <li key={i} style={{ color: 'var(--foreground-muted)' }}>{service.trim()}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Ad - In Article */}
                <div className="my-4">
                  <AdSense slot="8544579045" format="auto" responsive={true} />
                </div>

                {/* Gallery */}
                {business.gallery_images && business.gallery_images.length > 0 && (
                  <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Photos</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {business.gallery_images.map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden">
                          <img src={img} alt={`${business.name} - Photo ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Reviews */}
                {business.google_reviews && Array.isArray(business.google_reviews) && business.google_reviews.length > 0 && (
                  <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Avis Google</h2>
                      {business.google_rating && (
                        <div className="flex items-center gap-2">
                          <StarRating value={business.google_rating} />
                          <span className="font-bold" style={{ color: 'var(--foreground)' }}>{business.google_rating}</span>
                          <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>({business.google_reviews_count} avis)</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      {(business.google_reviews as Array<{text?: string; rating?: number; author_name?: string; relative_time_description?: string}>).filter(r => r.text).map((review, i) => (
                        <div key={i} className="rounded-lg p-3" style={{ background: 'var(--background-secondary)' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium" style={{ color: 'var(--foreground)' }}>{review.author_name || 'Anonyme'}</span>
                            <div className="flex items-center gap-2">
                              <StarRating value={review.rating || 0} />
                              {review.relative_time_description && (
                                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{review.relative_time_description}</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQ Section */}
                <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                  <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Questions fr&eacute;quentes</h2>
                  <div className="space-y-2">
                    {/* FAQ 1 - default open */}
                    <details className="group rounded-xl" style={{ background: 'var(--background-secondary)' }} open>
                      <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                        <span>Comment contacter {business.name} ?</span>
                        <span className="transition-transform group-open:rotate-180 inline-block">▼</span>
                      </summary>
                      <div className="px-4 pb-4 space-y-2 text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                        <p>
                          {business.name} est une entreprise{business.main_category_slug ? ` du secteur ${categoryLabels[business.main_category_slug] || business.main_category_slug}` : ''} situ&eacute;e &agrave; {displayAddress || business.city || 'Québec'}
                          {displayCity && displayAddress ? `, ${displayCity}` : ''}
                          {business.region && `, dans la région administrative de ${business.region}`}
                          {business.mrc && ` (MRC ${business.mrc})`}
                          {displayPostalCode && `, ${displayPostalCode}`}.
                          {' '}Vous pouvez contacter {business.name} de plusieurs façons :
                        </p>
                        {displayPhone && <p>Par t&eacute;l&eacute;phone au {displayPhone}. N&apos;h&eacute;sitez pas &agrave; appeler pour prendre rendez-vous ou obtenir plus d&apos;informations sur les services offerts.</p>}
                        {displayEmail && <p>Par courriel &agrave; l&apos;adresse {displayEmail}. Un membre de l&apos;&eacute;quipe se fera un plaisir de r&eacute;pondre &agrave; vos questions.</p>}
                        {business.website && <p>En visitant le site web officiel : {business.website.replace(/^https?:\/\//, '').replace(/\/+$/, '')}. Vous y trouverez des informations compl&eacute;mentaires sur l&apos;entreprise, ses services et ses r&eacute;alisations.</p>}
                        <p>Vous pouvez &eacute;galement vous rendre directement sur place{displayAddress ? ` au ${displayAddress}` : ''}{displayCity ? ` &agrave; ${displayCity}` : ''} durant les heures d&apos;ouverture.</p>
                      </div>
                    </details>

                    {business.main_category_slug && (
                      <details className="group rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                        <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                          <span>Dans quel domaine {business.name} se sp&eacute;cialise ?</span>
                          <span className="transition-transform group-open:rotate-180 inline-block">▼</span>
                        </summary>
                        <div className="px-4 pb-4 space-y-2 text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                          <p>
                            {business.name} est une entreprise sp&eacute;cialis&eacute;e dans le domaine &laquo;{' '}
                            {categoryLabels[business.main_category_slug] || business.main_category_slug} &raquo;, offrant ses services
                            {business.city ? ` à ${business.city}` : ' au Québec'}
                            {business.region ? ` et dans l'ensemble de la région de ${business.region}` : ''}.
                            Cette entreprise se distingue par son expertise et son engagement envers la qualit&eacute; de ses prestations.
                          </p>
                          {(business.ai_services && business.ai_services.length > 0) ? (
                            <>
                              <p>Les principaux services offerts par {business.name} incluent :</p>
                              <ul className="list-disc list-inside space-y-1 ml-2">
                                {business.ai_services.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                              <p>Chacun de ces services est offert avec professionnalisme et adapt&eacute; aux besoins sp&eacute;cifiques de chaque client, que ce soit pour les particuliers ou les entreprises.</p>
                            </>
                          ) : business.products_services ? (
                            <p>Parmi ses services : {business.products_services.split('\n').filter(Boolean).slice(0, 5).join(', ')}.</p>
                          ) : null}
                        </div>
                      </details>
                    )}

                    {business.google_rating && (
                      <details className="group rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                        <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                          <span>Quelle est la r&eacute;putation de {business.name} ?</span>
                          <span className="transition-transform group-open:rotate-180 inline-block">▼</span>
                        </summary>
                        <div className="px-4 pb-4 space-y-2 text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                          <p>
                            {business.name} a obtenu une note de {business.google_rating} sur 5 sur Google
                            {business.google_reviews_count > 0 && `, basée sur ${business.google_reviews_count} avis vérifiés de clients`}.
                            {business.google_rating >= 4.5 && ` Cette excellente note place ${business.name} parmi les entreprises les mieux évaluées de ${business.city || 'sa région'}. Les clients apprécient particulièrement la qualité du service, le professionnalisme de l'équipe et la fiabilité des prestations.`}
                            {business.google_rating >= 4 && business.google_rating < 4.5 && ` Cette très bonne note témoigne de la satisfaction générale de la clientèle de ${business.name}. L'entreprise maintient un haut niveau de qualité dans ses services.`}
                            {business.google_rating >= 3 && business.google_rating < 4 && ` Cette note reflète une satisfaction correcte de la part des clients.`}
                          </p>
                          <p>
                            Les avis Google sont un indicateur important de la qualit&eacute; d&apos;une entreprise. Nous vous encourageons &agrave; consulter les avis d&eacute;taill&eacute;s ci-dessus et &agrave; partager votre propre exp&eacute;rience avec {business.name}.
                          </p>
                        </div>
                      </details>
                    )}

                    {hasOpeningHours && (
                      <details className="group rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                        <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                          <span>Quelles sont les heures d&apos;ouverture de {business.name} ?</span>
                          <span className="transition-transform group-open:rotate-180 inline-block">▼</span>
                        </summary>
                        <div className="px-4 pb-4" style={{ color: 'var(--foreground-muted)' }}>
                          Consultez les heures d&apos;ouverture dans la section &quot;Heures d&apos;ouverture&quot; sur cette page.
                        </div>
                      </details>
                    )}
                  </div>
                </div>

                {/* Analyse de l'entreprise */}
                {business.main_category_slug && (
                  <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Analyse de l&apos;entreprise</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="rounded-lg p-4 text-center" style={{ background: 'var(--background-secondary)' }}>
                        <span className="text-2xl block mb-1">🏢</span>
                        <span className="text-xs font-medium block" style={{ color: 'var(--foreground-muted)' }}>Type</span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                          {categoryLabels[business.main_category_slug] || business.main_category_slug}
                        </span>
                      </div>
                      <div className="rounded-lg p-4 text-center" style={{ background: 'var(--background-secondary)' }}>
                        <span className="text-2xl block mb-1">📍</span>
                        <span className="text-xs font-medium block" style={{ color: 'var(--foreground-muted)' }}>Zone desservie</span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                          {business.city}{business.region ? ` et ${business.region}` : ''}
                        </span>
                      </div>
                      <div className="rounded-lg p-4 text-center" style={{ background: 'var(--background-secondary)' }}>
                        <span className="text-2xl block mb-1">{business.google_rating && business.google_rating >= 4 ? '⭐' : '🎯'}</span>
                        <span className="text-xs font-medium block" style={{ color: 'var(--foreground-muted)' }}>
                          {business.google_rating ? 'Note Google' : 'Statut'}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                          {business.google_rating ? `${business.google_rating}/5` : 'Entreprise vérifiée'}
                          {business.google_reviews_count > 0 ? ` (${business.google_reviews_count} avis)` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                      {seo?.analysis ? (
                        <p>{seo.analysis}</p>
                      ) : business.ai_services && business.ai_services.length > 0 ? (
                        <p>
                          {business.name} se positionne dans le secteur{' '}
                          <strong style={{ color: 'var(--foreground)' }}>{categoryLabels[business.main_category_slug] || business.main_category_slug}</strong>
                          {business.city ? ` à ${business.city}` : ''}.
                          {business.google_rating && business.google_rating >= 4
                            ? ` Avec une note de ${business.google_rating}/5, cette entreprise figure parmi les mieux évaluées de sa catégorie dans la région.`
                            : ` L'entreprise offre ses services aux résidents et entreprises de la région.`}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Score (si SEO content disponible) */}
                {seo?.score_popularity && (
                  <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Score de l&apos;entreprise <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">beta</span></h2>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Popularité', value: seo.score_popularity, icon: '📈' },
                        { label: 'Services', value: seo.score_services || 0, icon: '🛍️' },
                        { label: 'Accessibilité', value: seo.score_accessibility || 0, icon: '📍' },
                      ].map((item) => (
                        <div key={item.label} className="text-center">
                          <span className="text-2xl block">{item.icon}</span>
                          <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: 'var(--background-secondary)' }}>
                            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{ width: `${item.value * 10}%` }} />
                          </div>
                          <span className="text-lg font-bold block mt-1" style={{ color: 'var(--foreground)' }}>{item.value}/10</span>
                          <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pertinence locale */}
                {business.city && (
                  <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                    <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Présence locale</h2>
                    <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                      {seo?.local_context ? (
                        <p>{seo.local_context}</p>
                      ) : (
                        <>
                          <p>
                            {business.name} joue un rôle important dans l&apos;économie locale de {business.city}
                            {business.region ? ` et de la région de ${business.region}` : ''}.
                            {business.main_category_slug
                              ? ` En tant qu'entreprise du secteur ${categoryLabels[business.main_category_slug] || business.main_category_slug}, elle contribue à offrir des services essentiels aux résidents et aux entreprises locales.`
                              : ''}
                          </p>
                          {business.neq && (
                            <p>
                              Entreprise enregistrée au Registre des entreprises du Québec (NEQ : {business.neq}).
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Réputation (si SEO content) */}
                {seo?.reputation_text && (
                  <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                    <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Avis et réputation</h2>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                      {seo.reputation_text}
                    </p>
                  </div>
                )}

                {/* Comment trouver */}
                <div className="rounded-xl p-6" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                    Comment trouver {business.name}
                  </h2>
                  <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                    <p>
                      Vous êtes à la recherche {business.main_category_slug ? `d'une entreprise de ${categoryLabels[business.main_category_slug] || business.main_category_slug}` : 'd\'une entreprise'}
                      {business.city ? ` à ${business.city}` : ' au Québec'} ?
                      La fiche complète de {business.name} ci-dessus contient toutes les informations dont vous avez besoin :
                      {displayPhone ? ` numéro de téléphone (${displayPhone}),` : ''}
                      {displayEmail ? ' adresse courriel,' : ''}
                      {displayAddress ? ' adresse civique,' : ''}
                      {business.website ? ' lien vers le site web officiel,' : ''}
                      {' '}ainsi que les avis de clients vérifiés.
                    </p>
                    {business.city && business.main_category_slug && (
                      <p>
                        Découvrez également d&apos;autres entreprises de{' '}
                        <Link href={`/categorie/${business.main_category_slug}`} className="text-sky-400 hover:text-sky-300 underline">
                          {categoryLabels[business.main_category_slug] || business.main_category_slug}
                        </Link>
                        {' '}à{' '}
                        <Link href={`/ville/${citySlug}`} className="text-sky-400 hover:text-sky-300 underline">
                          {business.city}
                        </Link>
                        {' '}ou parcourez notre{' '}
                        <Link href="/recherche" className="text-sky-400 hover:text-sky-300 underline">annuaire complet</Link>
                        {' '}pour trouver l&apos;entreprise qui répond le mieux à vos besoins.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Contact Card */}
                {hasContactInfo && (
                  <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Coordonn&eacute;es</h3>
                    <div className="space-y-4">
                      {displayAddress && (
                        <div className="flex items-start gap-3">
                          📍
                          <div>
                            <span style={{ color: 'var(--foreground)' }}>{displayAddress}</span>
                            {displayCity && (
                              <span className="block text-sm" style={{ color: 'var(--foreground-muted)' }}>
                                {displayCity}{displayPostalCode && `, ${displayPostalCode}`}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {displayPhone && (
                        <div className="flex items-center gap-3">
                          📞
                          <a href={`tel:${displayPhone}`} className="text-sky-500 hover:text-sky-400">{displayPhone}</a>
                        </div>
                      )}
                      {displayEmail && (
                        <div className="flex items-center gap-3">
                          ✉️
                          <a href={`mailto:${displayEmail}`} className="text-sky-500 hover:text-sky-400 truncate">{displayEmail}</a>
                        </div>
                      )}
                      {business.website && (
                        <div className="flex items-center gap-3">
                          🌐
                          <a href={addUtm(business.website)} target="_blank" rel="noopener noreferrer nofollow" className="text-sky-500 hover:text-sky-400 truncate">
                            {business.website.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
                          </a>
                        </div>
                      )}
                      {business.neq && (
                        <>
                          <hr className="border-white/10" />
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🏛️</span>
                            <div>
                              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>NEQ: </span>
                              <span style={{ color: 'var(--foreground)' }}>{business.neq}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Map */}
                {(business.latitude && business.longitude) && (
                  <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Localisation</h3>
                    <div className="rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="250"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(business.longitude) - 0.01}%2C${Number(business.latitude) - 0.01}%2C${Number(business.longitude) + 0.01}%2C${Number(business.latitude) + 0.01}&layer=mapnik&marker=${business.latitude}%2C${business.longitude}`}
                      />
                    </div>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${business.latitude}&mlon=${business.longitude}#map=16/${business.latitude}/${business.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-block mt-3 text-sm text-sky-500 hover:text-sky-400 transition-colors"
                    >
                      Voir sur OpenStreetMap
                    </a>
                  </div>
                )}

                {/* Official Source */}
                <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Source officielle</h3>
                  <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>
                    Cette fiche est bas&eacute;e sur les informations du Registre des entreprises du Qu&eacute;bec.
                  </p>
                  <a
                    href="https://www.registreentreprises.gouv.qc.ca/reqna/gr/gr03/gr03a71.rechercheregistre.mvc/gr03a71?choixdomaine=RegistreEntreprisesQuebec"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-sm text-sky-500 hover:text-sky-400 transition-colors"
                  >
                    Consulter le registre
                  </a>
                </div>

                {/* Opening Hours */}
                {hasOpeningHours && (
                  <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Heures d&apos;ouverture</h3>
                    <div>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, idx) => {
                        const hours = business.opening_hours?.[day]
                        if (!hours) return null
                        return (
                          <div
                            key={day}
                            className={`flex justify-between py-2 ${idx < 6 ? 'border-b border-white/10' : ''}`}
                          >
                            <span className="font-medium" style={{ color: 'var(--foreground)' }}>{dayNames[day]}</span>
                            <span style={{ color: 'var(--foreground-muted)' }}>
                              {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Social Media */}
                {hasSocialMedia && (
                  <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>R&eacute;seaux sociaux</h3>
                    <div className="flex flex-wrap gap-2">
                      {business.facebook_url && (
                        <a
                          href={business.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1877f2] text-white hover:bg-[#1565d8] transition-colors"
                        >
                          f
                        </a>
                      )}
                      {business.instagram_url && (
                        <a
                          href={business.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white hover:opacity-90 transition-opacity"
                          style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
                        >
                          IG
                        </a>
                      )}
                      {business.linkedin_url && (
                        <a
                          href={business.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0077b5] text-white hover:bg-[#006699] transition-colors"
                        >
                          in
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Share */}
                <div className="rounded-xl p-6 shadow-lg" style={{ background: 'var(--background)' }}>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Partager</h3>
                  <div className="flex gap-2">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://registreduquebec.com/entreprise/${business.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1877f2] hover:bg-[#1565d8] transition-colors"
                    >
                      Facebook
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://registreduquebec.com/entreprise/${business.slug}`)}&text=${encodeURIComponent(`Découvrez ${business.name} à ${business.city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-black hover:bg-neutral-800 transition-colors"
                    >
                      X
                    </a>
                  </div>
                </div>

                {/* Ad - Sidebar Sticky */}
                <div className="sticky top-24">
                  <AdSense slot="8544579045" format="auto" responsive={true} style={{ minHeight: '600px' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ad - Leaderboard before recommendations */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <AdSense slot="8544579045" format="auto" responsive={true} style={{ minHeight: '90px' }} />
        </div>

        {/* City Businesses */}
        {cityBusinesses.length > 0 && business.city && (
          <section className="py-8" style={{ background: 'var(--background)' }}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                <Link href={`/ville/${citySlug}`} className="hover:text-sky-400 transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Entreprises &agrave; {business.city}
                </Link>
              </h2>
              <p className="mb-3" style={{ color: 'var(--foreground-muted)' }}>Autres entreprises dans cette ville</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cityBusinesses.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/entreprise/${biz.slug}`}
                    className="block rounded-xl p-4 transition-all hover:shadow-xl hover:-translate-y-0.5"
                    style={{ background: 'var(--background-secondary)' }}
                  >
                    <span className="block font-bold mb-1 line-clamp-2" style={{ color: 'var(--foreground)' }}>{biz.name}</span>
                    {biz.main_category_slug && (
                      <span className="block text-sm" style={{ color: 'var(--foreground-muted)' }}>{categoryLabels[biz.main_category_slug] || biz.main_category_slug}</span>
                    )}
                    {biz.google_rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <StarRating value={biz.google_rating} />
                        <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{biz.google_rating}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
              <Link
                href={`/ville/${citySlug}`}
                className="inline-block mt-3 text-sm text-sky-500 hover:text-sky-400 transition-colors"
              >
                Voir toutes les entreprises &agrave; {business.city} &rarr;
              </Link>
            </div>
          </section>
        )}

      </main>

      <Footer />
    </>
  )
}
