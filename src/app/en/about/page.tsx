import type { Metadata } from 'next'
import Link from 'next/link'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Discover the Quebec Business Registry, the most comprehensive directory of Quebec businesses with over 46,000 listings.',
}

export default function AboutPageEN() {
  return (
    <>
      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
            <p className="text-xl text-gray-600">
              The most comprehensive directory of Quebec businesses
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            {/* Mission */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Quebec Business Registry&apos;s mission is to facilitate the discovery and connection
                with Quebec businesses. We believe that every business, whether small or large,
                deserves to be visible and accessible.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free platform allows consumers to easily find the businesses they need,
                while offering business owners a tool to manage their online presence.
              </p>
            </section>

            {/* Stats */}
            <section className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">46,000+</div>
                  <div className="text-gray-600">Businesses listed</div>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">17</div>
                  <div className="text-gray-600">Quebec regions</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                  <div className="text-gray-600">Free</div>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Advanced Search</h3>
                    <p className="text-gray-600">Easily find businesses by name, category, city, or region.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Complete Information</h3>
                    <p className="text-gray-600">Address, phone, website, business hours, reviews, and more.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl">✏️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Listing Management</h3>
                    <p className="text-gray-600">Owners can claim and manage their listing for free.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl">⭐</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Reviews and Ratings</h3>
                    <p className="text-gray-600">Check Google reviews to choose the best businesses.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Sources */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our data comes from several reliable sources:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Registraire des entreprises du Québec (government public data)</li>
                <li>Google Places API (information and reviews)</li>
                <li>Direct submissions by business owners</li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Have questions, suggestions, or need help? Don&apos;t hesitate to contact us.
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li>📧 <a href="mailto:info@h1site.com" className="text-blue-600 hover:underline">info@h1site.com</a></li>
                <li>📍 Vaudreuil-Dorion, Quebec, Canada</li>
              </ul>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/en/add-business"
              className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add your business for free
            </Link>
          </div>
        </div>
      </main>

      <FooterEN />
    </>
  )
}
