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

function PhoneIcon({ className = 'w-5 h-5', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}

function EmailIcon({ className = 'w-5 h-5', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}

function GlobeIcon({ className = 'w-5 h-5', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

function NavigationIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )
}

function LocationIcon({ className = 'w-5 h-5', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

function StarIconFilled({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function StarIconEmpty({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function StarHalf({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="halfStar">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfStar)" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  )
}

function CheckIcon({ className = 'w-4.5 h-4.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ChevronIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function FacebookIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function LinkedInIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

/* ---- Star rating component ---- */

function StarRating({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      stars.push(<StarIconFilled key={i} className={`${sizeClass} text-amber-400`} />)
    } else if (value >= i - 0.5) {
      stars.push(<StarHalf key={i} className={`${sizeClass} text-amber-400`} />)
    } else {
      stars.push(<StarIconEmpty key={i} className={`${sizeClass} text-amber-400/40`} />)
    }
  }
  return <span className="inline-flex items-center gap-0.5">{stars}</span>
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
                    <LocationIcon className="w-4 h-4" />
                    {business.city}, {business.region || 'Québec'}
                  </span>

                  {business.google_rating && (
                    <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10">
                      <StarIconFilled className="w-4 h-4 text-amber-500" />
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
                      <PhoneIcon className="w-4 h-4" />
                      Appeler
                    </a>
                  )}
                  {displayEmail && (
                    <a
                      href={`mailto:${displayEmail}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 transition-colors"
                    >
                      <EmailIcon className="w-4 h-4" />
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
                      <GlobeIcon className="w-4 h-4" />
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
                      <NavigationIcon className="w-4 h-4" />
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
                            <CheckIcon className="w-[18px] h-[18px] text-green-500 flex-shrink-0" />
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
                        <ChevronIcon className="w-5 h-5 transition-transform group-open:rotate-180" />
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
                          <ChevronIcon className="w-5 h-5 transition-transform group-open:rotate-180" />
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
                          <ChevronIcon className="w-5 h-5 transition-transform group-open:rotate-180" />
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
                          <ChevronIcon className="w-5 h-5 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="px-4 pb-4" style={{ color: 'var(--foreground-muted)' }}>
                          Consultez les heures d&apos;ouverture dans la section &quot;Heures d&apos;ouverture&quot; sur cette page.
                        </div>
                      </details>
                    )}
                  </div>
                </div>

                {/* SEO Content Block */}
                <div className="rounded-xl p-6" style={{ background: 'var(--background-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                    {business.name} — {business.main_category_slug ? categoryLabels[business.main_category_slug] || business.main_category_slug : 'Entreprise'} {business.city ? `à ${business.city}` : 'au Québec'}
                  </h2>
                  <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                    <p>
                      {business.name} est une entreprise qu&eacute;b&eacute;coise
                      {business.main_category_slug ? ` sp&eacute;cialis&eacute;e dans le secteur ${categoryLabels[business.main_category_slug] || business.main_category_slug}` : ''}
                      {business.city ? ` &eacute;tablie &agrave; ${business.city}` : ''}
                      {business.region ? `, dans la r&eacute;gion administrative de ${business.region}` : ''}
                      {business.mrc ? ` (MRC ${business.mrc})` : ''}.
                      {business.neq ? ` L'entreprise est officiellement enregistr&eacute;e au Registre des entreprises du Qu&eacute;bec sous le num&eacute;ro NEQ ${business.neq}.` : ''}
                      {' '}Cette fiche a &eacute;t&eacute; v&eacute;rifi&eacute;e et enrichie par notre &eacute;quipe afin de fournir les informations les plus pr&eacute;cises et &agrave; jour possibles.
                    </p>

                    {business.ai_description && (
                      <p>
                        {business.ai_description.length > 200
                          ? business.ai_description.substring(0, business.ai_description.lastIndexOf(' ', 200)) + '...'
                          : business.ai_description}
                        {' '}Pour en savoir plus sur les activit&eacute;s de {business.name}, consultez la description compl&egrave;te en haut de cette page.
                      </p>
                    )}

                    {business.ai_services && business.ai_services.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Services offerts par {business.name}</h3>
                        <p>
                          {business.name} propose une gamme compl&egrave;te de services pour r&eacute;pondre aux besoins de sa client&egrave;le.
                          Parmi les principaux services offerts, on retrouve : {business.ai_services.join(', ')}.
                          {business.city ? ` Ces services sont disponibles pour les r&eacute;sidents de ${business.city} et des municipalit&eacute;s environnantes.` : ''}
                          {business.region ? ` L'entreprise dessert &eacute;galement l'ensemble de la r&eacute;gion de ${business.region}.` : ''}
                        </p>
                      </div>
                    )}

                    {business.google_rating && business.google_reviews_count > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Avis et r&eacute;putation</h3>
                        <p>
                          Fort d&apos;une note de {business.google_rating} &eacute;toiles sur 5, {business.name} jouit d&apos;une {business.google_rating >= 4.5 ? 'excellente' : business.google_rating >= 4 ? 'tr&egrave;s bonne' : 'bonne'} r&eacute;putation
                          aupr&egrave;s de ses {business.google_reviews_count} &eacute;valuateurs sur Google.
                          Les avis clients constituent un indicateur fiable de la qualit&eacute; des services offerts et de l&apos;exp&eacute;rience client globale.
                          N&apos;h&eacute;sitez pas &agrave; consulter les avis d&eacute;taill&eacute;s disponibles sur cette page pour vous faire votre propre opinion.
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Comment trouver {business.name}</h3>
                      <p>
                        Vous &ecirc;tes &agrave; la recherche {business.main_category_slug ? `d'une entreprise de ${categoryLabels[business.main_category_slug] || business.main_category_slug}` : 'd\'une entreprise'}
                        {business.city ? ` &agrave; ${business.city}` : ' au Qu&eacute;bec'} ?
                        La fiche compl&egrave;te de {business.name} ci-dessus contient toutes les informations dont vous avez besoin :
                        {displayPhone ? ` num&eacute;ro de t&eacute;l&eacute;phone (${displayPhone}),` : ''}
                        {displayEmail ? ' adresse courriel,' : ''}
                        {displayAddress ? ' adresse civique,' : ''}
                        {business.website ? ' lien vers le site web officiel,' : ''}
                        {' '}ainsi que les avis de clients v&eacute;rifi&eacute;s.
                      </p>
                      {business.city && business.main_category_slug && (
                        <p className="mt-2">
                          D&eacute;couvrez &eacute;galement d&apos;autres entreprises de{' '}
                          <Link href={`/categorie/${business.main_category_slug}`} className="text-sky-400 hover:text-sky-300 underline">
                            {categoryLabels[business.main_category_slug] || business.main_category_slug}
                          </Link>
                          {' '}&agrave;{' '}
                          <Link href={`/ville/${citySlug}`} className="text-sky-400 hover:text-sky-300 underline">
                            {business.city}
                          </Link>
                          {' '}ou parcourez notre{' '}
                          <Link href="/recherche" className="text-sky-400 hover:text-sky-300 underline">annuaire complet</Link>
                          {' '}pour trouver l&apos;entreprise qui r&eacute;pond le mieux &agrave; vos besoins.
                        </p>
                      )}
                    </div>
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
                          <LocationIcon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--foreground-muted)' }} />
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
                          <PhoneIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--foreground-muted)' }} />
                          <a href={`tel:${displayPhone}`} className="text-sky-500 hover:text-sky-400">{displayPhone}</a>
                        </div>
                      )}
                      {displayEmail && (
                        <div className="flex items-center gap-3">
                          <EmailIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--foreground-muted)' }} />
                          <a href={`mailto:${displayEmail}`} className="text-sky-500 hover:text-sky-400 truncate">{displayEmail}</a>
                        </div>
                      )}
                      {business.website && (
                        <div className="flex items-center gap-3">
                          <GlobeIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--foreground-muted)' }} />
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
                          <FacebookIcon />
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
                          <InstagramIcon />
                        </a>
                      )}
                      {business.linkedin_url && (
                        <a
                          href={business.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0077b5] text-white hover:bg-[#006699] transition-colors"
                        >
                          <LinkedInIcon />
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
