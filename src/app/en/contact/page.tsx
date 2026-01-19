import type { Metadata } from 'next'
import Link from 'next/link'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact the Quebec Business Registry. Questions, suggestions, listing modification requests.',
}

export default function ContactPage() {
  return (
    <>
      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600">
              We are here to help
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:info@h1site.com" className="text-blue-600 hover:underline">
                      info@h1site.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">
                      Vaudreuil-Dorion<br />
                      Quebec, Canada
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Social Media</h3>
                    <a
                      href="https://www.facebook.com/groups/registreduquebec"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Facebook Group
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">How do I update my listing?</h3>
                  <p className="text-gray-600 text-sm">
                    Log in to your account and access your dashboard to modify your business information.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">How do I add my business?</h3>
                  <p className="text-gray-600 text-sm">
                    Click on &quot;Add a business&quot; in the menu and fill out the form.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">How do I report an error?</h3>
                  <p className="text-gray-600 text-sm">
                    Send us an email with the business name and the correction to be made.
                  </p>
                </div>

                <Link
                  href="/en/faq"
                  className="block text-center text-blue-600 hover:underline font-medium mt-4"
                >
                  View all FAQs
                </Link>
              </div>
            </div>
          </div>

          {/* Response Time */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 text-center">
            <p className="text-blue-800">
              <strong>Response Time:</strong> We typically respond within 24 to 48 business hours.
            </p>
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
