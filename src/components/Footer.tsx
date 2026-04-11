import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950">
      {/* Facebook Community Banner */}
      <div className="bg-gradient-to-r from-sky-900/50 to-blue-900/50 border-t border-sky-500/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">
                👥
              </div>
              <div className="text-center md:text-left">
                <strong className="block text-lg text-white">Rejoignez notre communauté!</strong>
                <span className="text-slate-300 text-sm">
                  Partagez et découvrez les meilleures entreprises du Québec
                </span>
              </div>
            </div>
            <a
              href="https://www.facebook.com/groups/registreduquebec"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all hover:-translate-y-0.5 shadow-lg"
            >
              <span className="w-6 h-6 bg-[#1877f2] text-white rounded-full flex items-center justify-center text-sm font-bold">
                f
              </span>
              Rejoindre le groupe
            </a>
          </div>
        </div>
      </div>

      {/* Popular Links */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Popular Categories */}
          <div>
            <h4 className="font-bold text-white mb-4">Catégories populaires</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { slug: 'construction-et-renovation', label: 'Construction et rénovation' },
                { slug: 'restauration-et-alimentation', label: 'Restauration et alimentation' },
                { slug: 'sante-et-bien-etre', label: 'Santé et bien-être' },
                { slug: 'commerce-de-detail', label: 'Commerce de détail' },
                { slug: 'services-professionnels', label: 'Services professionnels' },
                { slug: 'automobile-et-transport', label: 'Automobile et transport' },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categorie/${cat.slug}`}
                  className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-sky-400 text-xs font-medium transition-colors border border-slate-700/50"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
          {/* Popular Cities */}
          <div>
            <h4 className="font-bold text-white mb-4">Villes populaires</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { slug: 'montreal', label: 'Montréal' },
                { slug: 'quebec', label: 'Québec' },
                { slug: 'laval', label: 'Laval' },
                { slug: 'gatineau', label: 'Gatineau' },
                { slug: 'longueuil', label: 'Longueuil' },
                { slug: 'sherbrooke', label: 'Sherbrooke' },
                { slug: 'trois-rivieres', label: 'Trois-Rivières' },
                { slug: 'saguenay', label: 'Saguenay' },
                { slug: 'levis', label: 'Lévis' },
                { slug: 'terrebonne', label: 'Terrebonne' },
                { slug: 'drummondville', label: 'Drummondville' },
                { slug: 'saint-jean-sur-richelieu', label: 'Saint-Jean-sur-Richelieu' },
              ].map((city) => (
                <Link
                  key={city.slug}
                  href={`/ville/${city.slug}`}
                  className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-sky-400 text-xs font-medium transition-colors border border-slate-700/50"
                >
                  {city.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Searches — combo page links */}
        <div className="mt-8">
          <h4 className="font-bold text-white mb-4">Recherches populaires</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/categorie/restauration-et-alimentation/montreal', label: 'Restaurants à Montréal' },
              { href: '/categorie/construction-et-renovation/quebec', label: 'Construction à Québec' },
              { href: '/categorie/sante-et-bien-etre/laval', label: 'Santé à Laval' },
              { href: '/categorie/services-professionnels/gatineau', label: 'Services professionnels à Gatineau' },
              { href: '/categorie/automobile-et-transport/longueuil', label: 'Automobile à Longueuil' },
              { href: '/categorie/commerce-de-detail/sherbrooke', label: 'Commerce à Sherbrooke' },
              { href: '/categorie/technologie-et-informatique/montreal', label: 'Technologie à Montréal' },
              { href: '/categorie/immobilier/quebec', label: 'Immobilier à Québec' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-sky-400 text-xs font-medium transition-colors border border-slate-700/50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/images/logos/logo.webp"
                alt="Registre du Québec"
                width={48}
                height={48}
                className="rounded-xl drop-shadow-lg"
              />
              <span className="font-bold text-xl text-white">Registre du Québec</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              L&apos;annuaire le plus complet des entreprises québécoises.
              Trouvez facilement les meilleures entreprises près de chez vous.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/registreduquebec/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
                title="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/groups/registreduquebec"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
                title="Groupe Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-2h2v2zm0-4H9V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold text-white mb-6">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/recherche" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  Recherche
                </Link>
              </li>
              <li>
                <Link href="/parcourir/categories" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/blogue" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  Blogue
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-bold text-white mb-6">Informations</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/a-propos" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/entreprise/nouvelle" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  Ajouter une entreprise
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-6">Légal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/mentions-legales" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/plan-du-site" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  Plan du site
                </Link>
              </li>
              <li>
                <a href="/sitemap-index.xml" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                  Sitemap XML
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} Registre du Québec. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">
                Créé par{' '}
                <a
                  href="https://h1site.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
                >
                  H1Site.com
                </a>
              </span>
              <Link href="/en" className="text-slate-400 hover:text-white font-medium transition-colors flex items-center gap-1.5">
                <span>🌐</span> English
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
