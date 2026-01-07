import type { Business } from '@/types/business'
import Link from 'next/link'
import Image from 'next/image'
import { generateSlug } from '@/lib/utils'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'

interface Props {
  business: Business
  relatedBusinesses?: Business[]
}

const dayNames: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

export default function BusinessDetailsEN({ business, relatedBusinesses = [] }: Props) {
  const citySlug = generateSlug(business.city || '')

  const hasContactInfo = business.phone || business.email || business.website
  const hasSocialMedia = business.facebook_url || business.instagram_url || business.linkedin_url
  const hasOpeningHours = business.opening_hours && Object.keys(business.opening_hours).length > 0

  return (
    <>
      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white py-8 overflow-hidden">
          {/* Background Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url(/images/background/background-overlay.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="text-sm mb-6 flex items-center gap-2 text-blue-200 flex-wrap">
              <Link href="/en" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/en/search" className="hover:text-white transition-colors">
                Businesses
              </Link>
              <span>›</span>
              <Link href={`/en/city/${citySlug}`} className="hover:text-white transition-colors">
                {business.city}
              </Link>
              <span>›</span>
              <span className="text-white">{business.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              {business.logo_url ? (
                <div className="w-32 h-32 rounded-xl bg-white p-2 shrink-0">
                  <img
                    src={business.logo_url}
                    alt={`${business.name} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center shrink-0">
                  <span className="text-white/70 text-sm font-medium text-center px-2">No logo</span>
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {business.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-blue-100">
                  <span className="flex items-center gap-1">
                    <span>📍</span>
                    {business.city}, {business.region || 'Quebec'}
                  </span>

                  {business.google_rating && (
                    <span className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                      <span className="text-yellow-400">★</span>
                      <span className="font-bold text-white">{business.google_rating}</span>
                      {business.google_reviews_count && (
                        <span className="text-sm">({business.google_reviews_count} reviews)</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Call
                    </a>
                  )}

                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      Website
                    </a>
                  )}

                  {(business.latitude && business.longitude) && (
                    <a
                      href={`https://waze.com/ul?ll=${business.latitude},${business.longitude}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#33ccff] hover:bg-[#00b8f5] text-black rounded-lg font-medium transition-colors"
                    >
                      <Image src="/images/logos/waze.svg" alt="Waze" width={20} height={20} />
                      Directions
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* About Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                  {business.description_en ? (
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {business.description_en}
                    </p>
                  ) : business.description ? (
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {business.description}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      No description available for this business.
                    </p>
                  )}

                  {business.products_services && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-3">Products and Services</h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {business.products_services.split('\n').filter(Boolean).map((service, i) => (
                          <li key={i}>{service.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Gallery */}
                {business.gallery_images && business.gallery_images.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Photos</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {business.gallery_images.map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={img}
                            alt={`${business.name} - Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQ Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    <details className="group bg-gray-50 rounded-lg">
                      <summary className="p-4 font-medium cursor-pointer flex items-center justify-between text-gray-900">
                        Where is {business.name} located?
                        <span className="transform transition-transform group-open:rotate-180 text-gray-500">▼</span>
                      </summary>
                      <p className="px-4 pb-4 text-gray-600">
                        {business.name} is located in {business.city || 'Quebec'}
                        {business.region && `, in the ${business.region} region`}.
                      </p>
                    </details>

                    <details className="group bg-gray-50 rounded-lg">
                      <summary className="p-4 font-medium cursor-pointer flex items-center justify-between text-gray-900">
                        Does {business.name} have a phone number?
                        <span className="transform transition-transform group-open:rotate-180 text-gray-500">▼</span>
                      </summary>
                      <p className="px-4 pb-4 text-gray-600">
                        {business.phone
                          ? `Yes, you can contact ${business.name} at ${business.phone}.`
                          : `Phone information for ${business.name} is not available.`}
                      </p>
                    </details>

                    <details className="group bg-gray-50 rounded-lg">
                      <summary className="p-4 font-medium cursor-pointer flex items-center justify-between text-gray-900">
                        Does {business.name} have a website?
                        <span className="transform transition-transform group-open:rotate-180 text-gray-500">▼</span>
                      </summary>
                      <p className="px-4 pb-4 text-gray-600">
                        {business.website
                          ? `Yes, ${business.name} has a website at ${business.website}.`
                          : `Website information for ${business.name} is not available.`}
                      </p>
                    </details>

                    {hasOpeningHours && (
                      <details className="group bg-gray-50 rounded-lg">
                        <summary className="p-4 font-medium cursor-pointer flex items-center justify-between text-gray-900">
                          What are the opening hours of {business.name}?
                          <span className="transform transition-transform group-open:rotate-180 text-gray-500">▼</span>
                        </summary>
                        <p className="px-4 pb-4 text-gray-600">
                          Check the &quot;Opening Hours&quot; section on this page.
                        </p>
                      </details>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Contact Card */}
                {hasContactInfo && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      {business.address && (
                        <div className="flex items-start gap-3">
                          <span className="text-gray-400 mt-0.5">📍</span>
                          <div>
                            <p className="text-gray-900">{business.address}</p>
                            {business.city && (
                              <p className="text-gray-600">
                                {business.city}, {business.postal_code}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {business.phone && (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">📞</span>
                          <a href={`tel:${business.phone}`} className="text-blue-600 hover:underline">
                            {business.phone}
                          </a>
                        </div>
                      )}

                      {business.email && business.show_email && (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">✉️</span>
                          <a href={`mailto:${business.email}`} className="text-blue-600 hover:underline">
                            {business.email}
                          </a>
                        </div>
                      )}

                      {business.website && (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">🌐</span>
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            {business.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}

                      {business.neq && (
                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                          <span className="text-gray-400">🏛️</span>
                          <div>
                            <span className="text-sm text-gray-500">NEQ: </span>
                            <span className="text-gray-900">{business.neq}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Map */}
                {(business.latitude && business.longitude) && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
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
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <span>🗺️</span>
                      View on OpenStreetMap
                    </a>
                  </div>
                )}

                {/* Official Source */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Official source</h3>
                  <p className="text-sm text-gray-600">
                    This listing is based on information from the Quebec Enterprise Register.
                  </p>
                  <a
                    href="https://www.registreentreprises.gouv.qc.ca/reqna/gr/gr03/gr03a71.rechercheregistre.mvc/gr03a71?choixdomaine=RegistreEntreprisesQuebec"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Open the register
                  </a>
                </div>

                {/* Opening Hours */}
                {hasOpeningHours && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Opening Hours</h3>
                    <div className="space-y-2">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                        const hours = business.opening_hours?.[day]
                        if (!hours) return null

                        return (
                          <div key={day} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                            <span className="font-medium text-gray-700">{dayNames[day]}</span>
                            <span className="text-gray-600">
                              {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Social Media */}
                {hasSocialMedia && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media</h3>
                    <div className="flex flex-wrap gap-3">
                      {business.facebook_url && (
                        <a
                          href={business.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-[#1877f2] text-white rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                          title="Facebook"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                      {business.instagram_url && (
                        <a
                          href={business.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                          title="Instagram"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {business.linkedin_url && (
                        <a
                          href={business.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-[#0077b5] text-white rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                          title="LinkedIn"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Share Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Share</h3>
                  <div className="flex gap-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://registreduquebec.com/company/${business.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-[#1877f2] text-white rounded-lg text-center text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Facebook
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://registreduquebec.com/company/${business.slug}`)}&text=${encodeURIComponent(`Discover ${business.name} in ${business.city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-black text-white rounded-lg text-center text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      X
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Businesses */}
        {relatedBusinesses.length > 0 && (
          <section className="py-8 bg-gray-100">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Discover businesses in the region
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBusinesses.map((biz) => {
                  return (
                    <Link
                      key={biz.id}
                      href={`/company/${biz.slug}`}
                      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                    >
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{biz.name}</h3>
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        <span>📍</span> {biz.city}
                      </p>
                      {biz.google_rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{biz.google_rating}</span>
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section - Only show if business is not claimed */}
        {!business.owner_id && (
          <section className="py-12 bg-blue-900 text-white">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Is this your business?
              </h2>
              <p className="text-blue-200 mb-6">
                Claim your listing for free to update your information and manage your online presence.
              </p>
              <Link
                href="/en/login"
                className="inline-block px-6 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Claim this listing
              </Link>
            </div>
          </section>
        )}
      </main>

      <FooterEN />
    </>
  )
}
