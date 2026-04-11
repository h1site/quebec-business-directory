'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

interface Claim {
  id: string
  name: string
  city: string
  slug: string
  claim_email: string | null
  claim_status: string
  created_at: string
}

export default function ReclamationsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchClaims = async (status: string) => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch(`/api/claims?status=${status}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    if (res.ok) {
      const data = await res.json()
      setClaims(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchClaims(filter)
  }, [filter])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch(`/api/claims/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action }),
    })

    if (res.ok) {
      setClaims(prev => prev.filter(c => c.id !== id))
    }
    setActionLoading(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">Réclamations</h1>
        <p className="text-[var(--foreground-muted)] mt-1">{claims.length} réclamation{claims.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === s
                ? 'bg-sky-500 text-white'
                : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)] border border-white/10 hover:bg-white/5'
            }`}
          >
            {s === 'pending' ? 'En attente' : s === 'approved' ? 'Approuvées' : 'Rejetées'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-white/10 rounded-xl" />
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-[var(--background-secondary)] rounded-xl  border border-white/5 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Aucune réclamation</h2>
          <p className="text-[var(--foreground-muted)]">
            {filter === 'pending' ? 'Aucune réclamation en attente' : `Aucune réclamation ${filter === 'approved' ? 'approuvée' : 'rejetée'}`}
          </p>
        </div>
      ) : (
        <div className="bg-[var(--background-secondary)] rounded-xl  border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground-muted)]">Entreprise</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground-muted)] hidden md:table-cell">Ville</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground-muted)]">Demandeur</th>
                  {filter === 'pending' && (
                    <th className="text-right px-6 py-4 text-sm font-semibold text-[var(--foreground-muted)]">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <Link
                        href={`/entreprise/${claim.slug}`}
                        target="_blank"
                        className="font-medium text-sky-400 hover:text-sky-400"
                      >
                        {claim.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-[var(--foreground-muted)]">
                      {claim.city}
                    </td>
                    <td className="px-6 py-4 text-[var(--foreground-muted)] text-sm">
                      {claim.claim_email || '—'}
                    </td>
                    {filter === 'pending' && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(claim.id, 'approve')}
                            disabled={actionLoading === claim.id}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => handleAction(claim.id, 'reject')}
                            disabled={actionLoading === claim.id}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Rejeter
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
