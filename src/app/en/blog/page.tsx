import type { Metadata } from 'next'
import Link from 'next/link'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Discover our articles and tips for Quebec businesses.',
}

export default function BlogPageEN() {
  return (
    <>
      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
            <p className="text-xl text-gray-600">
              Tips and news for Quebec businesses
            </p>
          </div>

          {/* Coming Soon */}
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Our blog is being prepared. Soon, you&apos;ll find articles,
              tips, and resources here to help you grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/en/search"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search for a business
              </Link>
              <Link
                href="/en"
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to home
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-8 bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Stay Informed
            </h3>
            <p className="text-gray-600 mb-4">
              Join our Facebook community to be notified of new articles.
            </p>
            <a
              href="https://www.facebook.com/groups/registreduquebec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1877f2] text-white font-semibold rounded-lg hover:bg-[#166fe5] transition-colors"
            >
              <span className="w-5 h-5 bg-white text-[#1877f2] rounded-full flex items-center justify-center text-xs font-bold">f</span>
              Join the group
            </a>
          </div>
        </div>
      </main>

      <FooterEN />
    </>
  )
}
