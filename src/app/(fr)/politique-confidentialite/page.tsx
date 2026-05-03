import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité du Registre d\'entreprises du Québec - Protection de vos données personnelles selon la Loi 25.',
  alternates: { canonical: 'https://registreduquebec.com/politique-confidentialite' },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Politique de confidentialité</h1>

            <div className="prose prose-gray max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  La protection de vos données personnelles est une priorité pour RegistreDuQuebec.com.
                  Cette politique de confidentialité explique quelles informations nous collectons,
                  comment nous les utilisons, et vos droits en vertu de la Loi 25 sur la protection
                  des renseignements personnels au Québec.
                </p>
                <p className="text-gray-600 mt-4">
                  <strong>Dernière mise à jour :</strong> Janvier 2025
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Informations collectées</h2>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Informations que vous nous fournissez</h3>
                <p className="text-gray-700 leading-relaxed">
                  Lorsque vous utilisez notre plateforme, nous pouvons collecter :
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Nom et prénom (si vous créez un compte)</li>
                  <li>Adresse courriel</li>
                  <li>Numéro de téléphone (facultatif)</li>
                  <li>Informations d&apos;entreprise (nom, adresse, NEQ, description, etc.)</li>
                  <li>Photos et logos uploadés</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Informations collectées automatiquement</h3>
                <p className="text-gray-700 leading-relaxed">
                  Lors de votre navigation, nous collectons :
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Adresse IP</li>
                  <li>Type de navigateur et appareil</li>
                  <li>Pages visitées et durée de visite</li>
                  <li>Données de navigation (cookies essentiels uniquement)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Informations publiques</h3>
                <p className="text-gray-700 leading-relaxed">
                  Certaines données d&apos;entreprises proviennent de sources publiques gouvernementales
                  (Registraire des entreprises du Québec) et sont déjà accessibles au public selon la loi.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Utilisation des données</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous utilisons vos données uniquement pour :
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Fournir et améliorer nos services</li>
                  <li>Gérer votre compte utilisateur</li>
                  <li>Permettre aux entreprises de revendiquer et gérer leurs fiches</li>
                  <li>Répondre à vos demandes de support</li>
                  <li>Assurer la sécurité et prévenir la fraude</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                  Nous ne vendons jamais vos données personnelles à des tiers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies et technologies similaires</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous utilisons uniquement des cookies essentiels nécessaires au bon fonctionnement du site :
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Cookies de session (authentification)</li>
                  <li>Préférences de langue</li>
                  <li>Consentement aux cookies</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Nous n&apos;utilisons pas de cookies publicitaires, de tracking ou d&apos;analyse comportementale.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Partage des données</h2>
                <p className="text-gray-700 leading-relaxed">
                  Vos données personnelles ne sont partagées qu&apos;avec :
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Supabase (hébergement base de données - serveurs au Canada)</li>
                  <li>Google Places API (enrichissement données entreprises - données publiques uniquement)</li>
                  <li>Autorités légales (si requis par la loi)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                  Aucun partage à des fins commerciales, publicitaires ou marketing.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Vos droits (Loi 25)</h2>
                <p className="text-gray-700 leading-relaxed">
                  En vertu de la Loi 25 sur la protection des renseignements personnels, vous avez le droit de :
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Accéder à vos données personnelles</li>
                  <li>Rectifier vos données si elles sont inexactes</li>
                  <li>Supprimer votre compte et vos données</li>
                  <li>Retirer votre consentement à tout moment</li>
                  <li>Porter plainte auprès de la Commission d&apos;accès à l&apos;information du Québec (CAI)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Pour exercer vos droits, contactez-nous : <strong>info@h1site.com</strong>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Sécurité des données</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Chiffrement des données en transit (HTTPS/SSL)</li>
                  <li>Authentification sécurisée</li>
                  <li>Accès restreint aux données sensibles</li>
                  <li>Sauvegardes régulières</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Conservation des données</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services
                  ou respecter nos obligations légales. Vous pouvez demander la suppression de votre compte à tout moment.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications de cette politique</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous nous réservons le droit de modifier cette politique de confidentialité.
                  Toute modification sera publiée sur cette page avec la date de mise à jour.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
                <p className="text-gray-700 leading-relaxed">
                  Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
                </p>
                <ul className="list-none text-gray-700 mt-4 space-y-2">
                  <li>📧 info@h1site.com</li>
                  <li>📍 Vaudreuil-Dorion, Québec, Canada</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
