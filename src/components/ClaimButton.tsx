'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button, Box, Chip } from '@mui/material'
import Link from 'next/link'
import VerifiedIcon from '@mui/icons-material/Verified'

interface Props {
  businessId: string
  businessSlug: string
  isClaimed: boolean
  claimStatus: string | null
  ownerIdExists: boolean
  inline?: boolean
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
      if (session) {
        setUser({ id: session.user.id, email: session.user.email || '' })
      }
      setAuthChecked(true)
    })
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
      return <Chip label="Réclamation envoyée" color="success" size="small" icon={<VerifiedIcon />} />
    }

    if (!user) {
      return (
        <Button
          component={Link}
          href={`/connexion?redirect=/entreprise/${businessSlug}`}
          variant="contained"
          size="small"
          startIcon={<VerifiedIcon />}
          sx={{ bgcolor: '#f59e0b', color: '#000', '&:hover': { bgcolor: '#d97706' } }}
        >
          Réclamer
        </Button>
      )
    }

    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <Button
          onClick={handleClaim}
          disabled={status === 'loading'}
          variant="contained"
          size="small"
          startIcon={<VerifiedIcon />}
          sx={{ bgcolor: '#f59e0b', color: '#000', '&:hover': { bgcolor: '#d97706' } }}
        >
          {status === 'loading' ? 'Envoi...' : 'Réclamer'}
        </Button>
        {status === 'error' && (
          <Box component="span" sx={{ color: '#fca5a5', fontSize: '0.75rem' }}>{errorMsg}</Box>
        )}
      </Box>
    )
  }

  // Full section mode (not used anymore but kept for flexibility)
  return null
}
