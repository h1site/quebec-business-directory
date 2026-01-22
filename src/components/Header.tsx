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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

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
      isScrolled
        ? 'bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/20'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/logos/logo.webp"
              alt="Registre du Québec"
              width={40}
              height={40}
              className="rounded-xl drop-shadow-lg group-hover:scale-105 transition-transform brightness-0 invert"
            />
            <div className="hidden sm:block">
              <span className="font-bold text-white text-sm">Registre du Québec</span>
              <span className="ml-2 px-2 py-0.5 bg-sky-500/20 text-sky-400 text-[10px] font-semibold rounded-full uppercase tracking-wide">
                Bêta
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg font-medium text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              Accueil
            </Link>
            <Link
              href="/recherche"
              className="px-4 py-2 rounded-lg font-medium text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              Recherche
            </Link>
            <Link
              href="/entreprise/nouvelle"
              className="px-4 py-2 rounded-lg font-medium text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              Ajouter
            </Link>

            <div className="w-px h-5 mx-2 bg-slate-700" />

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/tableau-de-bord"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all bg-white/10 hover:bg-white/20 border border-white/10"
                    >
                      {user.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt=""
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-white hidden xl:block">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-lg font-medium text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/connexion"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold text-sm transition-all btn-glow"
                  >
                    Connexion
                  </Link>
                )}
              </>
            )}

            <a
              href="https://www.paypal.com/donate/?hosted_button_id=GUPL4K5WR3ZG4"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5"
            >
              <span>❤️</span>
              <span className="hidden xl:inline">Don</span>
            </a>

            <Link
              href="/en"
              className="ml-2 px-3 py-2 rounded-lg font-medium text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              EN
            </Link>
          </div>

          {/* Mobile: Language + Menu */}
          <div className="flex lg:hidden items-center gap-3">
            <Link
              href="/en"
              className="px-2 py-1 rounded text-sm font-medium text-slate-400 hover:text-white"
            >
              EN
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden glass-dark rounded-2xl p-4 mb-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {user && (
                <Link
                  href="/tableau-de-bord"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl mb-2 transition-colors"
                >
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt=""
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-white block">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-slate-400">Tableau de bord</span>
                  </div>
                </Link>
              )}

              <Link
                href="/"
                onClick={closeMenu}
                className="text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/recherche"
                onClick={closeMenu}
                className="text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
              >
                Recherche
              </Link>
              <Link
                href="/entreprise/nouvelle"
                onClick={closeMenu}
                className="text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
              >
                Ajouter une entreprise
              </Link>

              <hr className="my-3 border-slate-700" />

              {user ? (
                <button
                  onClick={() => {
                    handleLogout()
                    closeMenu()
                  }}
                  className="text-red-400 font-medium py-3 px-4 rounded-xl hover:bg-red-500/10 transition-colors text-left"
                >
                  Déconnexion
                </button>
              ) : (
                <Link
                  href="/connexion"
                  onClick={closeMenu}
                  className="bg-sky-500 hover:bg-sky-600 text-white text-center py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  Connexion avec Google
                </Link>
              )}

              <a
                href="https://www.paypal.com/donate/?hosted_button_id=GUPL4K5WR3ZG4"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2"
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
