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

export default function ClaimButtonEN({ businessId, businessSlug, isClaimed, claimStatus, ownerIdExists, inline }: Props) {
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
      if (session) {
        setUser({ id: session.user.id, email: session.user.email || '' })
      }
      setAuthChecked(true)
    })
  }, [supabase])

  if (isClaimed || ownerIdExists) return null

  const handleClaim = async () => {
    if (!user) return
    setStatus('loading')
    setErrorMsg('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setStatus('error')
      setErrorMsg('Session expired, please log in again.')
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
      setErrorMsg(data.error || 'An error occurred')
    }
  }

  if (!authChecked) return null

  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg font-medium">
        ✓ Claim submitted
      </span>
    )
  }

  if (!user) {
    return (
      <Link
        href={`/en/login?redirect=/en/company/${businessSlug}`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors text-sm"
      >
        ✓ Claim
      </Link>
    )
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        onClick={handleClaim}
        disabled={status === 'loading'}
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending...' : '✓ Claim'}
      </button>
      {status === 'error' && (
        <span className="text-red-300 text-xs">{errorMsg}</span>
      )}
    </span>
  )
}
