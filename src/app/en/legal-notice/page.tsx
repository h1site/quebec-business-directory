import type { Metadata } from 'next'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'

export const metadata: Metadata = {
  title: 'Legal Notice',
  description: 'Legal Notice of the Quebec Business Registry - Information about the publisher, hosting, and terms of use.',
}

export default function LegalNoticePageEN() {
  return (
    <>
      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Legal Notice</h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-8">
                Last updated: January 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Site Publisher</h2>
                <p className="text-gray-700 leading-relaxed">
                  The website RegistreDuQuebec.com is published by:
                </p>
                <ul className="list-none text-gray-700 mt-4 space-y-2">
                  <li><strong>Name:</strong> RegistreDuQuebec.com</li>
                  <li><strong>Address:</strong> Vaudreuil-Dorion, Quebec, Canada</li>
                  <li><strong>Email:</strong> info@h1site.com</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Hosting</h2>
                <p className="text-gray-700 leading-relaxed">
                  The site is hosted by:
                </p>
                <ul className="list-none text-gray-700 mt-4 space-y-2">
                  <li><strong>Host:</strong> Vercel Inc.</li>
                  <li><strong>Address:</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Database hosted by:
                </p>
                <ul className="list-none text-gray-700 mt-4 space-y-2">
                  <li><strong>Provider:</strong> Supabase Inc.</li>
                  <li><strong>Data location:</strong> Canada</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed">
                  All content on the RegistreDuQuebec.com website (texts, images, logos, design, source code)
                  is protected by copyright. Any unauthorized reproduction, representation, modification, or exploitation
                  is prohibited.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Business data comes in part from government public sources
                  (Registraire des entreprises du Québec) and is accessible to the public by law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  The information published on this site is provided for informational purposes only and does not
                  engage the publisher&apos;s liability. Despite our efforts to maintain accurate and up-to-date information,
                  we cannot guarantee the accuracy, completeness, or relevance
                  of the data presented.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Use of the information available on this site is at the user&apos;s sole responsibility.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Hyperlinks</h2>
                <p className="text-gray-700 leading-relaxed">
                  The site may contain links to other websites. The publisher has no control
                  over these sites and disclaims all responsibility for their content.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Applicable Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These legal notices are governed by Quebec and Canadian law.
                  Any dispute relating to the use of the site shall be subject to the jurisdiction of Quebec courts.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
                <p className="text-gray-700 leading-relaxed">
                  For any questions regarding these legal notices, you can contact us:
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
