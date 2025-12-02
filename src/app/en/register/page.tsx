'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'

export default function RegisterPageEN() {
  const router = useRouter()
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
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        setSuccess('Account created! Check your email to confirm your registration.')
        setLoading(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/en" className="inline-block">
              <Image
                src="/images/logos/logo.webp"
                alt="Quebec Business Registry"
                width={180}
                height={60}
                className="mx-auto"
              />
            </Link>
          </div>

          {/* Signup Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Create an account
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Join thousands of Quebec entrepreneurs
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

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">or with email</span>
              </div>
            </div>

            {/* Email Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create my account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/en/terms-of-use" className="text-blue-600 hover:underline">
                terms of use
              </Link>{' '}
              and our{' '}
              <Link href="/en/privacy-policy" className="text-blue-600 hover:underline">
                privacy policy
              </Link>
            </p>

            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/en/login" className="text-blue-600 hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-8 bg-green-50 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-3">100% free registration</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Create your profile in seconds
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Add or claim your business
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                No hidden fees or commitment
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Email support included
              </li>
            </ul>
          </div>
        </div>
      </main>

      <FooterEN />
    </>
  )
}
