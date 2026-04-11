'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/connexion?redirect=/tableau-de-bord')
      } else {
        setUser(session.user)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/connexion')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isAdmin = user?.email === 'info@h1site.com'

  const navItems = [
    { href: '/tableau-de-bord', label: 'Tableau de bord', icon: '📊' },
    { href: '/tableau-de-bord/entreprises', label: isAdmin ? 'Toutes les entreprises' : 'Mes entreprises', icon: '🏢' },
    ...(isAdmin ? [{ href: '/tableau-de-bord/reclamations', label: 'Réclamations', icon: '📋' }] : []),
    { href: '/tableau-de-bord/profil', label: 'Mon profil', icon: '👤' },
    { href: '/tableau-de-bord/avis', label: 'Mes avis', icon: '⭐' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: 'var(--foreground-muted)' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30 border-r border-white/5" style={{ background: 'var(--background-secondary)' }}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <Image src="/images/logos/logo.webp" alt="Registre du Québec" width={40} height={40} className="rounded-lg brightness-0 invert" />
              <div>
                <span className="font-bold block" style={{ color: 'var(--foreground)' }}>Registre du Québec</span>
                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Tableau de bord</span>
              </div>
            </Link>
          </div>

          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url ? (
                <Image src={user.user_metadata.avatar_url} alt="" width={40} height={40} className="rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors no-underline ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400'
                      : 'hover:bg-white/5'
                  }`}
                  style={!isActive ? { color: 'var(--foreground-muted)' } : undefined}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-2">
            <Link
              href="/entreprise/nouvelle"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sky-500 text-white hover:bg-sky-400 font-medium transition-colors no-underline"
            >
              <span className="text-xl">+</span>
              Ajouter entreprise
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 font-medium transition-colors no-underline"
              style={{ color: 'var(--foreground-muted)' }}
            >
              <span className="text-xl">🏠</span>
              Retour au site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 font-medium transition-colors"
            >
              <span className="text-xl">🚪</span>
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-white/5" style={{ background: 'var(--background-secondary)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Image src="/images/logos/logo.webp" alt="Registre du Québec" width={32} height={32} className="rounded-lg brightness-0 invert" />
            <span className="font-bold" style={{ color: 'var(--foreground)' }}>Tableau de bord</span>
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: 'var(--foreground)' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 shadow-xl transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: 'var(--background-secondary)' }}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <Image src="/images/logos/logo.webp" alt="Registre du Québec" width={40} height={40} className="rounded-lg brightness-0 invert" />
              <div>
                <span className="font-bold block" style={{ color: 'var(--foreground)' }}>Registre du Québec</span>
                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Tableau de bord</span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: 'var(--foreground-muted)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url ? (
                <Image src={user.user_metadata.avatar_url} alt="" width={40} height={40} className="rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--foreground-muted)' }}>{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors no-underline ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400'
                      : 'hover:bg-white/5'
                  }`}
                  style={!isActive ? { color: 'var(--foreground-muted)' } : undefined}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-2">
            <Link
              href="/entreprise/nouvelle"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sky-500 text-white hover:bg-sky-400 font-medium transition-colors no-underline"
            >
              <span className="text-xl">+</span>
              Ajouter entreprise
            </Link>
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 font-medium transition-colors no-underline"
              style={{ color: 'var(--foreground-muted)' }}
            >
              <span className="text-xl">🏠</span>
              Retour au site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 font-medium transition-colors"
            >
              <span className="text-xl">🚪</span>
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="pt-16 lg:pt-0 min-h-screen">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
