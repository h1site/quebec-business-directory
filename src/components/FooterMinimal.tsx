import Link from 'next/link'

export default function FooterMinimal() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-gray-500 text-sm">
            © {currentYear} Registre d&apos;entreprises du Québec
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
            <Link href="/recherche" className="hover:text-white transition-colors">
              Recherche
            </Link>
            <Link href="/parcourir/categories" className="hover:text-white transition-colors">
              Catégories
            </Link>
            <Link href="/mentions-legales" className="hover:text-white transition-colors">
              Mentions légales
            </Link>
            <Link href="/en" className="hover:text-white transition-colors">
              English
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
