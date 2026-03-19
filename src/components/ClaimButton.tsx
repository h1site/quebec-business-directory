'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button, Box } from '@mui/material'
import Link from 'next/link'

interface Props {
  businessId: string
  businessSlug: string
  isClaimed: boolean
  claimStatus: string | null
  ownerIdExists: boolean
}

export default function ClaimButton({ businessId, businessSlug, isClaimed, claimStatus, ownerIdExists }: Props) {
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

  return (
    <Box
      component="section"
      sx={{
        py: 6,
        background: 'linear-gradient(to right, rgba(12,74,110,0.5), rgba(30,58,138,0.5))',
        borderTop: '1px solid rgba(14,165,233,0.2)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Box component="h2" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 2, color: 'white' }}>
          C&apos;est votre entreprise ?
        </Box>
        <Box sx={{ color: 'rgb(203,213,225)', mb: 3 }}>
          Réclamez votre fiche gratuitement pour mettre à jour vos informations et gérer votre présence en ligne.
        </Box>

        {status === 'success' ? (
          <Box sx={{ color: '#86efac', fontWeight: 600, fontSize: '1.1rem' }}>
            Réclamation envoyée ! Nous allons vérifier votre demande.
          </Box>
        ) : !user ? (
          <Button
            component={Link}
            href={`/connexion?redirect=/entreprise/${businessSlug}`}
            variant="contained"
            sx={{ bgcolor: 'white', color: '#0f172a', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 600 }}
          >
            Connectez-vous pour réclamer
          </Button>
        ) : (
          <>
            <Button
              onClick={handleClaim}
              disabled={status === 'loading'}
              variant="contained"
              sx={{ bgcolor: 'white', color: '#0f172a', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 600 }}
            >
              {status === 'loading' ? 'Envoi en cours...' : 'Réclamer cette fiche'}
            </Button>
            {status === 'error' && (
              <Box sx={{ color: '#fca5a5', mt: 2, fontSize: '0.9rem' }}>{errorMsg}</Box>
            )}
          </>
        )}
      </div>
    </Box>
  )
}
