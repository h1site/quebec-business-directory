import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950">
      {/* Community Banner */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80)' }}
        />
        <div className="absolute inset-0 bg-white/85" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left max-w-lg">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Faites partie de la communauté
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Rejoignez des milliers d&apos;entrepreneurs québécois. Partagez vos expériences, découvrez de nouvelles entreprises et développez votre réseau.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.facebook.com/groups/registreduquebec"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#1877f2] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-[#1565d8] transition-all hover:-translate-y-0.5 shadow-lg no-underline"
              >
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">f</span>
                Rejoindre le groupe
              </a>
              <a
                href="https://www.facebook.com/registreduquebec/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur text-white px-6 py-3.5 rounded-xl font-bold hover:bg-white/20 transition-all hover:-translate-y-0.5 border border-white/20 no-underline"
              >
                Suivre la page
              </a>
            </div>
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
