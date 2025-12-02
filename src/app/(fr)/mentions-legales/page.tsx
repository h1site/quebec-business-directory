import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du Registre d\'entreprises du Québec - Informations sur l\'éditeur, l\'hébergement et les conditions d\'utilisation.',
}

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Mentions légales</h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-8">
                Dernière mise à jour : Janvier 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Éditeur du site</h2>
                <p className="text-gray-700 leading-relaxed">
                  Le site RegistreDuQuebec.com est édité par :
                </p>
                <ul className="list-none text-gray-700 mt-4 space-y-2">
                  <li><strong>Nom :</strong> RegistreDuQuebec.com</li>
                  <li><strong>Adresse :</strong> Vaudreuil-Dorion, Québec, Canada</li>
                  <li><strong>Courriel :</strong> info@h1site.com</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Hébergement</h2>
                <p className="text-gray-700 leading-relaxed">
                  Le site est hébergé par :
                </p>
                <ul className="list-none text-gray-700 mt-4 space-y-2">
                  <li><strong>Hébergeur :</strong> Vercel Inc.</li>
                  <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Base de données hébergée par :
                </p>
                <ul className="list-none text-gray-700 mt-4 space-y-2">
                  <li><strong>Fournisseur :</strong> Supabase Inc.</li>
                  <li><strong>Localisation des données :</strong> Canada</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Propriété intellectuelle</h2>
                <p className="text-gray-700 leading-relaxed">
                  L&apos;ensemble du contenu du site RegistreDuQuebec.com (textes, images, logos, design, code source)
                  est protégé par le droit d&apos;auteur. Toute reproduction, représentation, modification ou exploitation
                  non autorisée est interdite.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Les données d&apos;entreprises proviennent en partie de sources publiques gouvernementales
                  (Registraire des entreprises du Québec) et sont accessibles au public selon la loi.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation de responsabilité</h2>
                <p className="text-gray-700 leading-relaxed">
                  Les informations publiées sur ce site sont fournies à titre indicatif et ne sauraient
                  engager la responsabilité de l&apos;éditeur. Malgré nos efforts pour maintenir des informations
                  à jour et exactes, nous ne pouvons garantir l&apos;exactitude, l&apos;exhaustivité ou la pertinence
                  des données présentées.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  L&apos;utilisation des informations disponibles sur ce site se fait sous la seule responsabilité
                  de l&apos;utilisateur.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Liens hypertextes</h2>
                <p className="text-gray-700 leading-relaxed">
                  Le site peut contenir des liens vers d&apos;autres sites web. L&apos;éditeur n&apos;exerce aucun contrôle
                  sur ces sites et décline toute responsabilité quant à leur contenu.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Droit applicable</h2>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes mentions légales sont régies par le droit québécois et canadien.
                  Tout litige relatif à l&apos;utilisation du site sera soumis à la compétence des tribunaux du Québec.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
                <p className="text-gray-700 leading-relaxed">
                  Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
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
