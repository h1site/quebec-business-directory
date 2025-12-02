import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez le Registre d\'entreprises du Québec, l\'annuaire le plus complet des entreprises québécoises avec plus de 600 000 fiches.',
}

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">À propos</h1>
            <p className="text-xl text-gray-600">
              L&apos;annuaire le plus complet des entreprises québécoises
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            {/* Mission */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre mission</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Le Registre d&apos;entreprises du Québec a pour mission de faciliter la découverte et la mise en relation
                avec les entreprises québécoises. Nous croyons que chaque entreprise, qu&apos;elle soit petite ou grande,
                mérite d&apos;être visible et accessible.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Notre plateforme gratuite permet aux consommateurs de trouver facilement les entreprises dont ils ont besoin,
                tout en offrant aux propriétaires d&apos;entreprises un outil pour gérer leur présence en ligne.
              </p>
            </section>

            {/* Stats */}
            <section className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">600 000+</div>
                  <div className="text-gray-600">Entreprises répertoriées</div>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">17</div>
                  <div className="text-gray-600">Régions du Québec</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                  <div className="text-gray-600">Gratuit</div>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ce que nous offrons</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Recherche avancée</h3>
                    <p className="text-gray-600">Trouvez facilement des entreprises par nom, catégorie, ville ou région.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Informations complètes</h3>
                    <p className="text-gray-600">Adresse, téléphone, site web, heures d&apos;ouverture, avis et plus encore.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl">✏️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Gestion de fiche</h3>
                    <p className="text-gray-600">Les propriétaires peuvent réclamer et gérer leur fiche gratuitement.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl">⭐</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Avis et évaluations</h3>
                    <p className="text-gray-600">Consultez les avis Google pour choisir les meilleures entreprises.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Sources */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sources de données</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nos données proviennent de plusieurs sources fiables :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Registraire des entreprises du Québec (données publiques gouvernementales)</li>
                <li>Google Places API (informations et avis)</li>
                <li>Soumissions directes par les propriétaires d&apos;entreprises</li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nous contacter</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vous avez des questions, des suggestions ou besoin d&apos;aide? N&apos;hésitez pas à nous contacter.
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li>📧 <a href="mailto:info@h1site.com" className="text-blue-600 hover:underline">info@h1site.com</a></li>
                <li>📍 Vaudreuil-Dorion, Québec, Canada</li>
              </ul>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/entreprise/nouvelle"
              className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter votre entreprise gratuitement
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
