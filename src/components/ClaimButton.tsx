'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

interface Props {
  businessId: string
  businessSlug: string
  isClaimed: boolean
  claimStatus: string | null
  ownerIdExists: boolean
  inline?: boolean
}

function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2L12 21.04l3.4 1.46 1.89-3.2 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" />
    </svg>
  )
}

export default function ClaimButton({ businessId, businessSlug, isClaimed, claimStatus, ownerIdExists, inline }: Props) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    claimStatus === 'pending' ? 'success' : 'idle'
  )
  const [errorMsg, setErrorMsg] = useState('')

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' })
      }
      setAuthChecked(true)
    })
    // Also listen for auth changes (user logs in while on the page)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' })
      } else {
        setUser(null)
      }
      setAuthChecked(true)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  // Don't show if already claimed/owned
  if (isClaimed || ownerIdExists) return null

  const handleClaim = async () => {
    if (!user) return
    setStatus('loading')
    setErrorMsg('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setStatus('error')
      setErrorMsg('Session expirée, veuillez vous reconnecter.')
      return
    }

    const res = await fetch('/api/claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ business_id: businessId }),
    })

    if (res.ok) {
      setStatus('success')
    } else {
      const data = await res.json()
      setStatus('error')
      setErrorMsg(data.error || 'Une erreur est survenue')
    }
  }

  // Inline mode: renders as a button in the action row
  if (inline) {
    if (!authChecked) return null

    if (status === 'success') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/60 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-700/50">
          <VerifiedIcon className="w-4 h-4" />
          Réclamation envoyée
        </span>
      )
    }

    if (!user) {
      return (
        <Link
          href={`/connexion?redirect=/entreprise/${businessSlug}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-black shadow-sm hover:bg-amber-600 transition-colors"
        >
          <VerifiedIcon className="w-4 h-4" />
          Réclamer
        </Link>
      )
    }

    return (
      <span className="inline-flex items-center gap-2">
        <button
          onClick={handleClaim}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-black shadow-sm hover:bg-amber-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <VerifiedIcon className="w-4 h-4" />
          {status === 'loading' ? 'Envoi...' : 'Réclamer'}
        </button>
        {status === 'error' && (
          <span className="text-xs text-red-300">{errorMsg}</span>
        )}
      </span>
    )
  }

  // Full section mode (not used anymore but kept for flexibility)
  return null
}
