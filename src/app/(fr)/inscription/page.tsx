'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        // Auto-login and redirect — no email verification needed
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (!loginError) {
          window.location.href = redirectTo
          return
        }
        setSuccess('Compte créé! Vous pouvez maintenant vous connecter.')
        setLoading(false)
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <>
      <Header />

      <div className="h-16 bg-[#0f172a]" />
      <main className="min-h-screen bg-gray-50 pt-8 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logos/logo.webp"
                alt="Registre du Québec"
                width={180}
                height={60}
                className="mx-auto"
              />
            </Link>
          </div>

          {/* Signup Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Créer un compte
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Rejoignez des milliers d&apos;entrepreneurs québécois
            </p>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {success}
              </div>
            )}


            {/* Email Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse courriel
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white" style={{ color: "#111827" }}
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white" style={{ color: "#111827" }}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white" style={{ color: "#111827" }}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Création en cours...' : 'Créer mon compte'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              En créant un compte, vous acceptez nos{' '}
              <Link href="/conditions-utilisation" className="text-blue-600 hover:underline">
                conditions d&apos;utilisation
              </Link>{' '}
              et notre{' '}
              <Link href="/politique-confidentialite" className="text-blue-600 hover:underline">
                politique de confidentialité
              </Link>
            </p>

            <p className="mt-6 text-center text-gray-600">
              Déjà un compte?{' '}
              <Link href={`/connexion${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-blue-600 hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-8 bg-green-50 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Inscription 100% gratuite</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Créez votre profil en quelques secondes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Ajoutez ou réclamez votre entreprise
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Aucun frais caché ni engagement
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Support par courriel inclus
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
