import Link from 'next/link'
import Image from 'next/image'

export default function FooterEN() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900">
      {/* Facebook Community Banner */}
      <div className="bg-[#1e3a5f] border-t-4 border-[#1877f2]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">👥</div>
              <div className="text-white text-center md:text-left">
                <strong className="block text-lg">Join our Facebook community!</strong>
                <span className="text-white/80 text-sm">
                  Share, connect and discover the best Quebec businesses
                </span>
              </div>
            </div>
            <a
              href="https://www.facebook.com/groups/registreduquebec"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#1877f2] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all hover:-translate-y-0.5 shadow-lg"
            >
              <span className="w-6 h-6 bg-[#1877f2] text-white rounded-full flex items-center justify-center text-sm font-bold">
                f
              </span>
              Join the group
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logos/logo.webp"
                alt="Quebec Business Registry"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="font-bold text-lg text-white">Quebec Business Registry</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The most complete directory of Quebec businesses.
              Over 46,000 quality businesses.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Navigation</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/en" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/en/search" className="hover:text-white transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/en/browse/categories" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/en/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Information</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/en/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/en/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/en/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/en/add-business" className="hover:text-white transition-colors">
                  Add a Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/en/legal-notice" className="hover:text-white transition-colors">
                  Legal Notice
                </Link>
              </li>
              <li>
                <Link href="/en/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-gray-500 text-sm">
              © {currentYear} Quebec Business Registry. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link href="/en/privacy-policy" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
                Privacy
              </Link>
              <span className="text-gray-600">·</span>
              <Link href="/en/legal-notice" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
                Legal Notice
              </Link>
              <span className="text-gray-600">·</span>
              <span className="text-gray-500">
                Created by{' '}
                <a
                  href="https://h1site.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
                >
                  H1Site.com
                </a>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                🌐 Français
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
