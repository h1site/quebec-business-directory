'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  business_id: string
  businesses: {
    name: string
    slug: string
    city: string
    main_category_slug: string | null
  }
}

function generateSlug(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchReviews = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        business_id,
        businesses (
          name,
          slug,
          city,
          main_category_slug
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    setReviews((data as unknown as Review[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleDelete = async (id: string) => {
    setDeleting(true)
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (!error) {
      setReviews(prev => prev.filter(r => r.id !== id))
    }
    setDeleteId(null)
    setDeleting(false)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ))
  }

  if (loading) {
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
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">Mes avis</h1>
        <p className="text-[var(--foreground-muted)] mt-1">{reviews.length} avis publié{reviews.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => {
            const business = review.businesses
            const businessUrl = business ? `/entreprise/${business.slug}` : '#'

            return (
              <div
                key={review.id}
                className="bg-[var(--background-secondary)] rounded-xl  border border-white/5 p-6"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    {business ? (
                      <Link
                        href={businessUrl}
                        className="text-lg font-semibold text-[var(--foreground)] hover:text-sky-400 transition-colors"
                      >
                        {business.name}
                      </Link>
                    ) : (
                      <span className="text-lg font-semibold text-[var(--foreground-muted)]">
                        Entreprise supprimée
                      </span>
                    )}
                    {business?.city && (
                      <p className="text-sm text-[var(--foreground-muted)]">📍 {business.city}</p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-lg">{renderStars(review.rating)}</div>
                      <span className="text-sm text-[var(--foreground-muted)]">
                        {new Date(review.created_at).toLocaleDateString('fr-CA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {review.comment && (
                      <p className="mt-3 text-[var(--foreground-muted)]">{review.comment}</p>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => setDeleteId(review.id)}
                      className="p-2 text-red-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-[var(--background-secondary)] rounded-xl  border border-white/5 p-12 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Aucun avis</h2>
          <p className="text-[var(--foreground-muted)] mb-6">
            Vous n&apos;avez pas encore laissé d&apos;avis sur des entreprises
          </p>
          <Link
            href="/recherche"
            className="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-400 transition-colors"
          >
            Découvrir des entreprises
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--background-secondary)] rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Supprimer cet avis?</h3>
              <p className="text-[var(--foreground-muted)] mb-6">
                Cette action est irréversible.
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
