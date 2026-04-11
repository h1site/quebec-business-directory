'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        setFormData({
          fullName: session.user.user_metadata?.full_name || '',
          phone: session.user.user_metadata?.phone || '',
        })
      }
      setLoading(false)
    }

    fetchUser()
  }, [supabase.auth])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        }
      })

      if (updateError) {
        setError('Erreur lors de la mise à jour du profil.')
        setSaving(false)
        return
      }

      setSuccess('Profil mis à jour avec succès!')
      setSaving(false)
    } catch (err) {
      setError('Une erreur est survenue.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className="h-64 bg-white/10 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">Mon profil</h1>
        <p className="text-[var(--foreground-muted)] mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Profile Card */}
      <div className="bg-[var(--background-secondary)] rounded-xl  border border-white/5 p-6 lg:p-8">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-white/10 mb-6">
          {user.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt=""
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-sky-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </h2>
            <p className="text-[var(--foreground-muted)]">{user.email}</p>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Membre depuis {new Date(user.created_at).toLocaleDateString('fr-CA', {
                year: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 text-emerald-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
              Adresse courriel
            </label>
            <input
              type="email"
              id="email"
              value={user.email || ''}
              disabled
              className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 text-[var(--foreground-muted)] cursor-not-allowed"
            />
            <p className="text-xs text-[var(--foreground-muted)] mt-1">
              L&apos;adresse courriel ne peut pas être modifiée
            </p>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
              Nom complet
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(514) 555-1234"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-[var(--background-secondary)] rounded-xl  border border-white/5 p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Informations du compte</h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <div>
              <p className="font-medium text-[var(--foreground)]">Méthode de connexion</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {user.app_metadata?.provider === 'google' ? 'Google' : 'Email / Mot de passe'}
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm rounded-full">
              Actif
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <div>
              <p className="font-medium text-[var(--foreground)]">Dernière connexion</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString('fr-CA')
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium text-[var(--foreground)]">ID utilisateur</p>
              <p className="text-sm text-[var(--foreground-muted)] font-mono">{user.id.slice(0, 8)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[var(--background-secondary)] rounded-xl  border border-red-200 p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-red-400 mb-4">Zone dangereuse</h2>
        <p className="text-[var(--foreground-muted)] mb-4">
          La suppression de votre compte est permanente et ne peut pas être annulée.
          Toutes vos données seront supprimées.
        </p>
        <button
          type="button"
          className="px-6 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-500/10 transition-colors"
          onClick={() => alert('Contactez-nous à info@registreduquebec.com pour supprimer votre compte.')}
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  )
}
