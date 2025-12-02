import type { Metadata } from 'next'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy of the Quebec Business Registry - Protection of your personal data under Law 25.',
}

export default function PrivacyPolicyPageEN() {
  return (
    <>
      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>

            <div className="prose prose-gray max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  Protecting your personal data is a priority for RegistreDuQuebec.com.
                  This privacy policy explains what information we collect,
                  how we use it, and your rights under Quebec&apos;s Law 25 on the protection
                  of personal information.
                </p>
                <p className="text-gray-600 mt-4">
                  <strong>Last updated:</strong> January 2025
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Collected</h2>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Information you provide</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you use our platform, we may collect:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>First and last name (if you create an account)</li>
                  <li>Email address</li>
                  <li>Phone number (optional)</li>
                  <li>Business information (name, address, NEQ, description, etc.)</li>
                  <li>Uploaded photos and logos</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Automatically collected information</h3>
                <p className="text-gray-700 leading-relaxed">
                  During your browsing, we collect:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>IP address</li>
                  <li>Browser and device type</li>
                  <li>Pages visited and visit duration</li>
                  <li>Browsing data (essential cookies only)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Public information</h3>
                <p className="text-gray-700 leading-relaxed">
                  Some business data comes from government public sources
                  (Registraire des entreprises du Québec) and is already publicly accessible by law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Use of Data</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use your data only to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Provide and improve our services</li>
                  <li>Manage your user account</li>
                  <li>Allow businesses to claim and manage their listings</li>
                  <li>Respond to your support requests</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with our legal obligations</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                  We never sell your personal data to third parties.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Similar Technologies</h2>
                <p className="text-gray-700 leading-relaxed">
                  We only use essential cookies necessary for the proper functioning of the site:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Session cookies (authentication)</li>
                  <li>Language preferences</li>
                  <li>Cookie consent</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We do not use advertising, tracking, or behavioral analysis cookies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your personal data is only shared with:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Supabase (database hosting - servers in Canada)</li>
                  <li>Google Places API (business data enrichment - public data only)</li>
                  <li>Legal authorities (if required by law)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                  No sharing for commercial, advertising, or marketing purposes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights (Law 25)</h2>
                <p className="text-gray-700 leading-relaxed">
                  Under Law 25 on the protection of personal information, you have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Access your personal data</li>
                  <li>Rectify your data if inaccurate</li>
                  <li>Delete your account and data</li>
                  <li>Withdraw your consent at any time</li>
                  <li>File a complaint with the Commission d&apos;accès à l&apos;information du Québec (CAI)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise your rights, contact us: <strong>info@h1site.com</strong>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your data:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Encryption of data in transit (HTTPS/SSL)</li>
                  <li>Secure authentication</li>
                  <li>Restricted access to sensitive data</li>
                  <li>Regular backups</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal data for as long as necessary to provide our services
                  or meet our legal obligations. You can request deletion of your account at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify this privacy policy.
                  Any changes will be posted on this page with the update date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
                <p className="text-gray-700 leading-relaxed">
                  For any questions regarding this privacy policy or your personal data:
                </p>
                <ul className="list-none text-gray-700 mt-4 space-y-2">
                  <li>📧 info@h1site.com</li>
                  <li>📍 Vaudreuil-Dorion, Quebec, Canada</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>

      <FooterEN />
    </>
  )
}
