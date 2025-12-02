'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

interface DashboardStats {
  businessCount: number
  reviewCount: number
  totalViews: number
}

interface Business {
  id: string
  name: string
  city: string
  slug: string
  main_category_slug: string
  google_rating: number | null
}

export default function DashboardPageEN() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({ businessCount: 0, reviewCount: 0, totalViews: 0 })
  const [recentBusinesses, setRecentBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      setUser(session.user)

      // Fetch user's businesses
      const { data: businesses, count: businessCount } = await supabase
        .from('businesses')
        .select('id, name, city, slug, main_category_slug, google_rating', { count: 'exact' })
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch user's reviews count
      const { count: reviewCount } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)

      setStats({
        businessCount: businessCount || 0,
        reviewCount: reviewCount || 0,
        totalViews: 0, // TODO: implement views tracking
      })

      setRecentBusinesses(businesses || [])
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Hello, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome to your dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              🏢
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.businessCount}</p>
              <p className="text-gray-600">Businesses</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
              ⭐
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.reviewCount}</p>
              <p className="text-gray-600">Reviews posted</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              👁️
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
              <p className="text-gray-600">Total views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/en/add-business"
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <span className="text-2xl">➕</span>
            <span className="font-medium text-blue-700">Add a business</span>
          </Link>
          <Link
            href="/en/dashboard/businesses"
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <span className="text-2xl">📋</span>
            <span className="font-medium text-gray-700">Manage my businesses</span>
          </Link>
          <Link
            href="/en/dashboard/profile"
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <span className="text-2xl">👤</span>
            <span className="font-medium text-gray-700">Edit my profile</span>
          </Link>
          <Link
            href="/en/search"
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <span className="text-2xl">🔍</span>
            <span className="font-medium text-gray-700">Search</span>
          </Link>
        </div>
      </div>

      {/* Recent Businesses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">My recent businesses</h2>
          <Link
            href="/en/dashboard/businesses"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View all →
          </Link>
        </div>

        {recentBusinesses.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentBusinesses.map((biz) => (
              <div key={biz.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{biz.name}</h3>
                    <p className="text-sm text-gray-500">📍 {biz.city}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {biz.google_rating && (
                      <span className="text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">
                        ⭐ {biz.google_rating}
                      </span>
                    )}
                    <Link
                      href={`/en/dashboard/businesses/${biz.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="font-medium text-gray-900 mb-2">No businesses yet</h3>
            <p className="text-gray-500 mb-4">
              You haven&apos;t added any business yet
            </p>
            <Link
              href="/en/add-business"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add my first business
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
