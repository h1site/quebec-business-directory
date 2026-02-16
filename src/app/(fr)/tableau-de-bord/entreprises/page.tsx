'use client'

import { useEffect, useState } from 'react'
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

export default function MyBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 50

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchBusinesses = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const admin = session.user.email === 'info@h1site.com'
    setIsAdmin(admin)

    const query = supabase
      .from('businesses')
      .select('id, name, city, slug, main_category_slug, google_rating, google_reviews_count, phone, website, created_at')
      .order('created_at', { ascending: false })

    if (!admin) {
      query.eq('owner_id', session.user.id)
    } else {
      query.limit(1000)
    }

    const { data } = await query
    setBusinesses(data || [])
    setFilteredBusinesses(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchBusinesses()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFilteredBusinesses(businesses)
    } else {
      const q = search.toLowerCase()
      setFilteredBusinesses(businesses.filter(b =>
        b.name.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q)
      ))
    }
    setCurrentPage(1)
  }, [search, businesses])

  const paginatedBusinesses = filteredBusinesses.slice((currentPage - 1) * perPage, currentPage * perPage)
  const totalPages = Math.ceil(filteredBusinesses.length / perPage)

  const handleDelete = async (id: string) => {
    setDeleting(true)
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id)

    if (!error) {
      setBusinesses(prev => prev.filter(b => b.id !== id))
    }
    setDeleteId(null)
    setDeleting(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {isAdmin ? 'Toutes les entreprises' : 'Mes entreprises'}
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredBusinesses.length} entreprise{filteredBusinesses.length !== 1 ? 's' : ''}
            {isAdmin && search && ` (filtrées de ${businesses.length})`}
          </p>
        </div>
        <Link
          href="/entreprise/nouvelle"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
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
            className="w-full sm:w-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white"
          />
        </div>
      )}

      {/* Businesses List */}
      {paginatedBusinesses.length > 0 ? (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Entreprise</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden md:table-cell">Ville</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">Note</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">Contact</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedBusinesses.map((biz) => {
                    const businessUrl = `/entreprise/${biz.slug}`

                    return (
                      <tr key={biz.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{biz.name}</p>
                            <p className="text-sm text-gray-500 md:hidden">📍 {biz.city}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-gray-600">{biz.city}</span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {biz.google_rating ? (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="font-medium">{biz.google_rating}</span>
                              {biz.google_reviews_count && (
                                <span className="text-gray-400 text-sm">({biz.google_reviews_count})</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex gap-2">
                            {biz.phone && (
                              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">📞</span>
                            )}
                            {biz.website && (
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">🌐</span>
                            )}
                            {!biz.phone && !biz.website && (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={businessUrl}
                              target="_blank"
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Voir"
                            >
                              👁️
                            </Link>
                            <Link
                              href={`/tableau-de-bord/entreprises/${biz.id}`}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              ✏️
                            </Link>
                            <button
                              onClick={() => setDeleteId(biz.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Precedent
              </button>
              <span className="text-gray-600 text-sm">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune entreprise</h2>
          <p className="text-gray-500 mb-6">
            Vous n&apos;avez pas encore ajouté d&apos;entreprise à votre compte
          </p>
          <Link
            href="/entreprise/nouvelle"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ajouter ma première entreprise
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Supprimer cette entreprise?</h3>
              <p className="text-gray-600 mb-6">
                Cette action est irréversible. Toutes les données de cette entreprise seront supprimées.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
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
