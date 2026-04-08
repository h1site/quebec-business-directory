'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

// Inline SVG icons
function MenuIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CloseIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function SearchIcon({ className = 'w-[18px] h-[18px]' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  )
}

function AddBusinessIcon({ className = 'w-[18px] h-[18px]' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7l9-4 9 4M4 7v7m16-7v7" />
    </svg>
  )
}

function HeartIcon({ className = 'w-[18px] h-[18px]' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function LogoutIcon({ className = 'w-[18px] h-[18px]' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
    </svg>
  )
}

function LoginIcon({ className = 'w-[18px] h-[18px]' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

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

  return (
    <>
      {/* AppBar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--foreground)]/10 shadow-md'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex items-center h-16">
          {/* Logo */}
          <Link href="/" prefetch={true} className="flex items-center gap-3 group no-underline">
            <Image
              src="/images/logos/logo.webp"
              alt="Registre du Québec"
              width={36}
              height={36}
              priority
              className="rounded-xl drop-shadow-lg group-hover:scale-105 transition-transform brightness-0 invert"
            />
            <span className="hidden sm:flex items-center gap-2">
              <span className="font-bold text-sm text-[var(--foreground)]">
                Registre du Québec
              </span>
              <span className="text-[0.6rem] leading-none px-1.5 py-0.5 border border-blue-500 text-blue-500 rounded-full font-medium">
                Bêta
              </span>
            </span>
          </Link>

          <div className="flex-grow" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 px-3 py-1.5 rounded-md transition-colors no-underline"
            >
              Accueil
            </Link>
            <Link
              href="/recherche"
              className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 px-3 py-1.5 rounded-md transition-colors no-underline flex items-center gap-1.5"
            >
              <SearchIcon />
              Recherche
            </Link>
            <Link
              href={user ? '/entreprise/nouvelle' : '/connexion?redirect=/entreprise/nouvelle'}
              className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 px-3 py-1.5 rounded-md transition-colors no-underline flex items-center gap-1.5"
            >
              <AddBusinessIcon />
              Ajouter
            </Link>

            {/* Divider */}
            <div className="w-px h-6 bg-[var(--foreground)]/10 mx-1" />

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-1">
                    <Link
                      href="/tableau-de-bord"
                      className="flex items-center gap-2 border border-[var(--foreground)]/10 text-[var(--foreground)] rounded-md px-3 py-1 text-sm no-underline hover:bg-[var(--foreground)]/5 transition-colors"
                    >
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="hidden xl:inline">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 rounded-md text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
                    >
                      <LogoutIcon />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/connexion"
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-md transition-colors no-underline"
                  >
                    <LoginIcon />
                    Connexion
                  </Link>
                )}
              </>
            )}

            <a
              href="https://www.paypal.com/donate/?hosted_button_id=GUPL4K5WR3ZG4"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm px-3 py-1.5 rounded-md transition-all no-underline"
            >
              <HeartIcon />
              <span className="hidden xl:inline">Don</span>
            </a>

            <Link
              href="/en"
              className="ml-1 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] font-semibold px-2 py-1.5 rounded-md transition-colors no-underline"
            >
              EN
            </Link>
          </nav>

          {/* Mobile */}
          <div className="flex lg:hidden items-center gap-1">
            <Link
              href="/en"
              className="text-sm text-[var(--foreground)]/60 font-semibold px-2 py-1.5 no-underline"
            >
              EN
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 text-[var(--foreground)] rounded-md hover:bg-[var(--foreground)]/5 transition-colors"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-[300px] bg-[var(--background)] p-4 shadow-2xl transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-base text-[var(--foreground)]">Menu</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-md text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {user && (
          <Link
            href="/tableau-de-bord"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3 w-full text-left bg-[var(--foreground)]/5 rounded-xl px-3 py-3 mb-4 no-underline hover:bg-[var(--foreground)]/10 transition-colors"
          >
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="w-9 h-9 rounded-full"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <div className="font-semibold text-[var(--foreground)] leading-tight text-sm">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </div>
              <div className="text-xs text-[var(--foreground)]/60">Tableau de bord</div>
            </div>
          </Link>
        )}

        <div className="flex flex-col gap-1">
          <Link
            href="/"
            onClick={() => setDrawerOpen(false)}
            className="w-full text-left text-[var(--foreground)] py-3 px-3 rounded-md hover:bg-[var(--foreground)]/5 transition-colors no-underline text-sm"
          >
            Accueil
          </Link>
          <Link
            href="/recherche"
            onClick={() => setDrawerOpen(false)}
            className="w-full text-left text-[var(--foreground)] py-3 px-3 rounded-md hover:bg-[var(--foreground)]/5 transition-colors no-underline flex items-center gap-2 text-sm"
          >
            <SearchIcon />
            Recherche
          </Link>
          <Link
            href={user ? '/entreprise/nouvelle' : '/connexion?redirect=/entreprise/nouvelle'}
            onClick={() => setDrawerOpen(false)}
            className="w-full text-left text-[var(--foreground)] py-3 px-3 rounded-md hover:bg-[var(--foreground)]/5 transition-colors no-underline flex items-center gap-2 text-sm"
          >
            <AddBusinessIcon />
            Ajouter une entreprise
          </Link>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--foreground)]/10 my-4" />

        {user ? (
          <button
            onClick={() => {
              handleLogout()
              setDrawerOpen(false)
            }}
            className="w-full text-left text-red-500 py-3 px-3 rounded-md hover:bg-red-500/10 transition-colors flex items-center gap-2 text-sm"
          >
            <LogoutIcon />
            Déconnexion
          </button>
        ) : (
          <Link
            href="/connexion"
            onClick={() => setDrawerOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-3 rounded-md transition-colors no-underline text-sm"
          >
            <LoginIcon />
            Connexion avec Google
          </Link>
        )}

        <a
          href="https://www.paypal.com/donate/?hosted_button_id=GUPL4K5WR3ZG4"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setDrawerOpen(false)}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 px-3 rounded-md transition-all no-underline text-sm"
        >
          <HeartIcon />
          Faire un don
        </a>
      </div>
    </>
  )
}
