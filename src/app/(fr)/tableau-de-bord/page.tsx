'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

interface DashboardStats {
  businessCount: number
  reviewCount: number
  totalViews: number
}

interface Business {
  id: string
  name: string
  city: string
  slug: string
  main_category_slug: string
  google_rating: number | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({ businessCount: 0, reviewCount: 0, totalViews: 0 })
  const [recentBusinesses, setRecentBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      setUser(session.user)

      const isAdmin = session.user.email === 'info@h1site.com'

      // Fetch businesses and reviews in parallel
      const businessQuery = supabase
        .from('businesses')
        .select('id, name, city, slug, main_category_slug, google_rating', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5)

      if (!isAdmin) {
        businessQuery.eq('owner_id', session.user.id)
      }

      const [
        { data: businesses, count: businessCount },
        { count: reviewCount }
      ] = await Promise.all([
        businessQuery,
        supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
      ])

      setStats({
        businessCount: businessCount || 0,
        reviewCount: reviewCount || 0,
        totalViews: 0, // TODO: implement views tracking
      })

      setRecentBusinesses(businesses || [])
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-white/10 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
          Bonjour, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          Bienvenue dans votre tableau de bord
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--background-secondary)] rounded-xl  p-6 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-2xl">
              🏢
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{stats.businessCount}</p>
              <p className="text-[var(--foreground-muted)]">Entreprises</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--background-secondary)] rounded-xl  p-6 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-2xl">
              ⭐
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{stats.reviewCount}</p>
              <p className="text-[var(--foreground-muted)]">Avis publiés</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--background-secondary)] rounded-xl  p-6 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-2xl">
              👁️
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{stats.totalViews}</p>
              <p className="text-[var(--foreground-muted)]">Vues totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--background-secondary)] rounded-xl  p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/entreprise/nouvelle"
            className="flex items-center gap-3 p-4 bg-sky-500/10 hover:bg-sky-500/10 rounded-xl transition-colors"
          >
            <span className="text-2xl">➕</span>
            <span className="font-medium text-sky-400">Ajouter une entreprise</span>
          </Link>
          <Link
            href="/tableau-de-bord/entreprises"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/5 rounded-xl transition-colors"
          >
            <span className="text-2xl">📋</span>
            <span className="font-medium text-[var(--foreground-muted)]">Gérer mes entreprises</span>
          </Link>
          <Link
            href="/tableau-de-bord/profil"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/5 rounded-xl transition-colors"
          >
            <span className="text-2xl">👤</span>
            <span className="font-medium text-[var(--foreground-muted)]">Modifier mon profil</span>
          </Link>
          <Link
            href="/recherche"
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/5 rounded-xl transition-colors"
          >
            <span className="text-2xl">🔍</span>
            <span className="font-medium text-[var(--foreground-muted)]">Rechercher</span>
          </Link>
        </div>
      </div>

      {/* Recent Businesses */}
      <div className="bg-[var(--background-secondary)] rounded-xl  border border-white/5">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Mes entreprises récentes</h2>
          <Link
            href="/tableau-de-bord/entreprises"
            className="text-sky-400 hover:text-sky-400 text-sm font-medium"
          >
            Voir tout →
          </Link>
        </div>

        {recentBusinesses.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentBusinesses.map((biz) => (
              <div key={biz.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-[var(--foreground)]">{biz.name}</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">📍 {biz.city}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {biz.google_rating && (
                      <span className="text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">
                        ⭐ {biz.google_rating}
                      </span>
                    )}
                    <Link
                      href={`/tableau-de-bord/entreprises/${biz.id}`}
                      className="text-sky-400 hover:text-sky-400 text-sm font-medium"
                    >
                      Modifier
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="font-medium text-[var(--foreground)] mb-2">Aucune entreprise</h3>
            <p className="text-[var(--foreground-muted)] mb-4">
              Vous n&apos;avez pas encore ajouté d&apos;entreprise
            </p>
            <Link
              href="/entreprise/nouvelle"
              className="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-400 transition-colors"
            >
              Ajouter ma première entreprise
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
