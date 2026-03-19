'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

interface Props {
  businessId: string
  businessSlug: string
  isClaimed: boolean
  claimStatus: string | null
  ownerIdExists: boolean
}

export default function ClaimButtonEN({ businessId, businessSlug, isClaimed, claimStatus, ownerIdExists }: Props) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    claimStatus === 'pending' ? 'success' : 'idle'
  )
  const [errorMsg, setErrorMsg] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({ id: session.user.id, email: session.user.email || '' })
      }
    })
  }, [supabase.auth])

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

  return (
    <section className="py-12 bg-blue-900 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Is this your business?</h2>
        <p className="text-blue-200 mb-6">
          Claim your listing for free to update your information and manage your online presence.
        </p>

        {status === 'success' ? (
          <p className="text-green-300 font-semibold text-lg">
            Claim submitted! We will review your request shortly.
          </p>
        ) : !user ? (
          <Link
            href={`/en/login?redirect=/en/company/${businessSlug}`}
            className="inline-block px-6 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Log in to claim
          </Link>
        ) : (
          <>
            <button
              onClick={handleClaim}
              disabled={status === 'loading'}
              className="inline-block px-6 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Submitting...' : 'Claim this listing'}
            </button>
            {status === 'error' && (
              <p className="text-red-300 mt-3 text-sm">{errorMsg}</p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
