'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logos/logo.webp"
              alt="Registre d'entreprises du Québec"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="font-bold text-xs xl:text-sm hidden lg:block text-gray-900 whitespace-nowrap">
              Registre d'entreprises du Québec
            </span>
            <span className="px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-[10px] font-bold rounded-full uppercase tracking-wide">
              Bêta
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            <Link
              href="/"
              className="px-3 py-2 rounded-lg font-medium text-sm transition-colors text-gray-700 hover:bg-gray-100"
            >
              Accueil
            </Link>
            <Link
              href="/recherche"
              className="px-3 py-2 rounded-lg font-medium text-sm transition-colors text-gray-700 hover:bg-gray-100"
            >
              Recherche
            </Link>
            <Link
              href="/entreprise/nouvelle"
              className="px-3 py-2 rounded-lg font-medium text-sm transition-colors text-gray-700 hover:bg-gray-100 whitespace-nowrap"
            >
              Ajouter
            </Link>

            <div className="w-px h-5 mx-1 bg-gray-300" />

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-1">
                    <Link
                      href="/tableau-de-bord"
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors bg-gray-100 hover:bg-gray-200"
                    >
                      {user.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt=""
                          width={22}
                          height={22}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-medium max-w-[80px] truncate text-gray-700 hidden xl:block">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-2 py-1.5 rounded-lg font-medium text-xs transition-colors text-gray-600 hover:bg-gray-100"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/connexion"
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                    >
                      Connexion
                    </Link>
                  </>
                )}
              </>
            )}

            <a
              href="https://www.paypal.com/donate/?hosted_button_id=GUPL4K5WR3ZG4"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 px-2 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium text-sm hover:from-pink-600 hover:to-rose-600 transition-all flex items-center gap-1"
            >
              <span>❤️</span>
              <span className="hidden xl:inline">Don</span>
            </a>

            {/* Language Toggle */}
            <Link
              href="/en"
              className="ml-1 px-2 py-1.5 rounded-lg font-medium text-sm transition-colors text-gray-600 hover:bg-gray-100"
            >
              EN
            </Link>
          </div>

          {/* Mobile: Language + Menu */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/en"
              className="px-2 py-1 rounded text-sm font-medium text-gray-600"
            >
              EN
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <Image src="/images/icons/close.svg" alt="Fermer" width={28} height={28} />
              ) : (
                <Image src="/images/icons/menu.svg" alt="Menu" width={28} height={28} />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white rounded-xl shadow-xl p-4 mb-4 border border-gray-100">
            <div className="flex flex-col gap-1">
              {user && (
                <Link
                  href="/tableau-de-bord"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg mb-2 transition-colors"
                >
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt=""
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-900 block">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-gray-500">Tableau de bord</span>
                  </div>
                </Link>
              )}

              <Link
                href="/"
                onClick={closeMenu}
                className="text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                🏠 Accueil
              </Link>
              <Link
                href="/recherche"
                onClick={closeMenu}
                className="text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                🔍 Recherche
              </Link>
              <Link
                href="/entreprise/nouvelle"
                onClick={closeMenu}
                className="text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ➕ Ajouter une entreprise
              </Link>

              <hr className="my-2 border-gray-200" />

              {user ? (
                <button
                  onClick={() => {
                    handleLogout()
                    closeMenu()
                  }}
                  className="text-red-600 font-medium py-3 px-4 rounded-lg hover:bg-red-50 transition-colors text-left"
                >
                  Déconnexion
                </button>
              ) : (
                <Link
                  href="/connexion"
                  onClick={closeMenu}
                  className="bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Connexion avec Google
                </Link>
              )}

              <a
                href="https://www.paypal.com/donate/?hosted_button_id=GUPL4K5WR3ZG4"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <span>❤️</span>
                Faire un don
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
