'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

interface Business {
  id: string
  name: string
  city: string
  slug: string
  main_category_slug: string
  google_rating: number | null
  google_reviews_count: number | null
  phone: string | null
  website: string | null
  created_at: string
}

const perPage = 50

export default function MyBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchBusinesses = useCallback(async (page: number, searchQuery: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const admin = session.user.email === 'info@h1site.com'
    setIsAdmin(admin)
    setLoading(true)

    const offset = (page - 1) * perPage

    let query = supabase
      .from('businesses')
      .select('id, name, city, slug, main_category_slug, google_rating, google_reviews_count, phone, website, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)

    if (!admin) {
      query = query.eq('owner_id', session.user.id)
    }

    if (searchQuery.trim()) {
      query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
    }

    const { data, count } = await query
    setBusinesses(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchBusinesses(1, '')
  }, [fetchBusinesses])

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchBusinesses(1, search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, fetchBusinesses])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchBusinesses(page, search)
  }

  const totalPages = Math.ceil(totalCount / perPage)

  const handleDelete = async (id: string) => {
    setDeleting(true)

    let success = false
    let errorMsg = ''

    if (isAdmin) {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/admin/business/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      success = res.ok
      if (!success) errorMsg = `Erreur serveur (${res.status})`
    } else {
      const { error, count } = await supabase
        .from('businesses')
        .delete({ count: 'exact' })
        .eq('id', id)
      if (error) {
        errorMsg = error.message
      } else if (count === 0) {
        errorMsg = "Suppression bloquée. Vous n'êtes peut-être pas le propriétaire de cette fiche, ou les permissions sont restreintes. Contactez info@h1site.com."
      } else {
        success = true
      }
    }

    if (success) {
      setBusinesses(prev => prev.filter(b => b.id !== id))
      setTotalCount(prev => prev - 1)
    } else {
      alert(errorMsg || 'Suppression échouée')
    }
    setDeleteId(null)
    setDeleting(false)
  }

  if (loading && businesses.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/10 rounded w-1/3" />
        <div className="h-64 bg-white/10 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
            {isAdmin ? 'Toutes les entreprises' : 'Mes entreprises'}
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            {totalCount.toLocaleString('fr-CA')} entreprise{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/entreprise/nouvelle"
          className="px-6 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-400 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Ajouter une entreprise
        </Link>
      </div>

      {/* Search (admin only) */}
      {isAdmin && (
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou ville..."
            className="w-full sm:w-96 px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-[var(--foreground)] bg-[var(--background-secondary)]"
          />
        </div>
      )}

      {/* Businesses List */}
      {businesses.length > 0 ? (
        <>
          <div className="bg-[var(--background-secondary)] rounded-xl  border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground-muted)]">Entreprise</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground-muted)] hidden md:table-cell">Ville</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground-muted)] hidden lg:table-cell">Note</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground-muted)] hidden lg:table-cell">Contact</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-[var(--foreground-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {businesses.map((biz) => {
                    const businessUrl = `/entreprise/${biz.slug}`

                    return (
                      <tr key={biz.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-[var(--foreground)]">{biz.name}</p>
                            <p className="text-sm text-[var(--foreground-muted)] md:hidden">📍 {biz.city}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-[var(--foreground-muted)]">{biz.city}</span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {biz.google_rating ? (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="font-medium">{biz.google_rating}</span>
                              {biz.google_reviews_count && (
                                <span className="text-[var(--foreground-muted)] text-sm">({biz.google_reviews_count})</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[var(--foreground-muted)]">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex gap-2">
                            {biz.phone && (
                              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">📞</span>
                            )}
                            {biz.website && (
                              <span className="px-2 py-1 bg-sky-500/10 text-sky-400 text-xs rounded-full">🌐</span>
                            )}
                            {!biz.phone && !biz.website && (
                              <span className="text-[var(--foreground-muted)]">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={businessUrl}
                              target="_blank"
                              className="p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground-muted)] hover:bg-white/5 rounded-lg transition-colors"
                              title="Voir"
                            >
                              👁️
                            </Link>
                            <Link
                              href={`/tableau-de-bord/entreprises/${biz.id}`}
                              className="p-2 text-sky-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              ✏️
                            </Link>
                            <button
                              onClick={() => setDeleteId(biz.id)}
                              className="p-2 text-red-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[var(--background-secondary)] border border-white/10 rounded-lg hover:bg-white/5 font-medium text-[var(--foreground-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Precedent
              </button>
              <span className="text-[var(--foreground-muted)] text-sm">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[var(--background-secondary)] border border-white/10 rounded-lg hover:bg-white/5 font-medium text-[var(--foreground-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-[var(--background-secondary)] rounded-xl  border border-white/5 p-12 text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Aucune entreprise</h2>
          <p className="text-[var(--foreground-muted)] mb-6">
            {search ? 'Aucun resultat pour cette recherche' : 'Vous n\'avez pas encore ajoute d\'entreprise a votre compte'}
          </p>
          {!search && (
            <Link
              href="/entreprise/nouvelle"
              className="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-400 transition-colors"
            >
              Ajouter ma premiere entreprise
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--background-secondary)] rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Supprimer cette entreprise?</h3>
              <p className="text-[var(--foreground-muted)] mb-6">
                Cette action est irreversible. Toutes les donnees de cette entreprise seront supprimees.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-lg font-medium text-[var(--foreground-muted)] hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
